import { $app, Console, done, gRPC, Lodash as _ } from "@nsnanocat/util";
import database from "./function/database.mjs";
import setENV from "./function/setENV.mjs";
import { WireType, UnknownFieldHandler, reflectionMergePartial, MESSAGE_TYPE, MessageType, BinaryReader, isJsonObject, typeofJsonValue, jsonWriteOptions } from "@protobuf-ts/runtime/build/es2015/index.js";
import { Any } from "./protobuf/google/protobuf/any.js";
Console.logLevel = "DEBUG";
/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
Console.info(`url: ${url.toJSON()}`, "");
// 获取连接参数
const PATHs = url.pathname.split("/").filter(Boolean);
Console.info(`PATHs: ${PATHs}`, "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
Console.info(`FORMAT: ${FORMAT}`, "");
!(async () => {
	/**
	 * 设置
	 * @type {{Settings: import('./types').Settings}}
	 */
	const { Settings, Caches, Configs } = setENV("BiliBili", "Redirect", database);
	// 创建空数据
	let body = { code: 0, message: "0", data: {} };
	// 信息组
	const infoGroup = {
		seasonTitle: url.searchParams.get("season_title"),
		seasonId: Number.parseInt(url.searchParams.get("season_id"), 10) || undefined,
		epId: Number.parseInt(url.searchParams.get("ep_id"), 10) || undefined,
		mId: Number.parseInt(url.searchParams.get("mid") || url.searchParams.get("vmid"), 10) || undefined,
		evaluate: undefined,
		keyword: url.searchParams.get("keyword"),
		locale: url.searchParams.get("locale"),
		locales: [],
		type: "UGC",
	};
	// 格式判断
	switch (FORMAT) {
		case undefined: // 视为无body
			break;
		case "application/x-www-form-urlencoded":
		case "text/plain":
		default:
			break;
		case "application/x-mpegURL":
		case "application/x-mpegurl":
		case "application/vnd.apple.mpegurl":
		case "audio/mpegurl":
			//body = M3U8.parse($response.body);
			//Console.debug(`body: ${JSON.stringify(body)}`, "");
			//$response.body = M3U8.stringify(body);
			break;
		case "text/xml":
		case "text/html":
		case "text/plist":
		case "application/xml":
		case "application/plist":
		case "application/x-plist":
			//body = XML.parse($response.body);
			//Console.debug(`body: ${JSON.stringify(body)}`, "");
			//$response.body = XML.stringify(body);
			break;
		case "text/vtt":
		case "application/vtt":
			//body = VTT.parse($response.body);
			//Console.debug(`body: ${JSON.stringify(body)}`, "");
			//$response.body = VTT.stringify(body);
			break;
		case "text/json":
		case "application/json":
			body = JSON.parse($response.body ?? "{}");
			// 解析链接
			switch (url.hostname) {
				case "www.bilibili.com":
					break;
				case "app.bilibili.com":
				case "app.biliapi.net":
					break;
				case "api.bilibili.com":
				case "api.biliapi.net":
					switch (url.pathname) {
						case "/pgc/player/api/playurl": // 番剧-播放地址-api
						case "/pgc/player/web/playurl": // 番剧-播放地址-web
						case "/pgc/player/web/playurl/html5": // 番剧-播放地址-web-HTML5
							infoGroup.type = "PGC";
							break;
						case "/pgc/page/bangumi": // 追番页
						case "/pgc/page/cinema/tab": // 观影页
							infoGroup.type = "PGC";
							break;
						case "/x/player/wbi/playurl": // UGC-用户生产内容-播放地址
							break;
						case "/x/space/acc/info": // 用户空间-账号信息-pc
						case "/x/space/wbi/acc/info": // 用户空间-账号信息-wbi
							switch (infoGroup.mId) {
								case 11783021: // 哔哩哔哩番剧出差
								case 1988098633: // b站_戲劇咖
								case 2042149112: // b站_綜藝咖
									break;
								default:
									break;
							}
							break;
						case "/pgc/view/v2/app/season": // 番剧页面-内容-app
							break;
						case "/pgc/view/web/season": // 番剧-内容-web
						case "/pgc/view/pc/season": // 番剧-内容-pc
							break;
					}
					break;
			}
			$response.body = JSON.stringify(body);
			break;
		case "application/protobuf":
		case "application/x-protobuf":
		case "application/vnd.google.protobuf":
		case "application/grpc":
		case "application/grpc+proto":
		case "application/vnd.apple.flatbuffer":
		case "application/octet-stream": {
			//Console.debug(`$response.body: ${JSON.stringify($response.body)}`, "");
			let rawBody = $app === "Quantumult X" ? new Uint8Array($response.bodyBytes ?? []) : ($response.body ?? new Uint8Array());
			//Console.debug(`isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
			switch (FORMAT) {
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
					break;
				case "application/grpc":
				case "application/grpc+proto":
					rawBody = gRPC.decode(rawBody);
					// 解析链接并处理protobuf数据
					// 主机判断
					switch (url.hostname) {
						case "grpc.biliapi.net": // HTTP/2
						case "app.biliapi.net": // HTTP/1.1
						case "app.bilibili.com": // HTTP/1.1
							switch (PATHs?.[0]) {
								case "bilibili.app.viewunite.v1.View":
									/******************  initialization start  *******************/
									/******************  initialization finish  *******************/
									switch (PATHs?.[1]) {
										case "View": // 播放页
											break;
									}
									break;
								case "bilibili.app.playerunite.v1.Player": {
									/******************  initialization start  *******************/
									class Stream$Type extends MessageType {
										constructor() {
											super("bilibili.playershared.Stream", [
												{ no: 1, name: "stream_info", kind: "message", T: () => StreamInfo },
												{ no: 2, name: "dash_video", kind: "message", oneof: "content", T: () => DashVideo },
												{ no: 3, name: "segment_video", kind: "message", oneof: "content", T: () => SegmentVideo },
											]);
										}
									}
									const Stream = new Stream$Type();
									class StreamInfo$Type extends MessageType {
										constructor() {
											super("bilibili.playershared.StreamInfo", [
												{ no: 1, name: "quality", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
												{ no: 2, name: "format", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 3, name: "description", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 4, name: "err_code", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
												//{ no: 5, name: "limit", kind: "message", T: () => StreamLimit },
												{ no: 6, name: "need_vip", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
												{ no: 7, name: "need_login", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
												{ no: 8, name: "intact", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
												{ no: 9, name: "no_rexcode", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
												{ no: 10, name: "attribute", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 2 /*LongType.NUMBER*/ },
												{ no: 11, name: "new_description", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 12, name: "display_desc", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 13, name: "superscript", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 14, name: "vip_free", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
												{ no: 15, name: "subtitle", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												//{ no: 16, name: "scheme", kind: "message", T: () => Scheme },
												{ no: 17, name: "support_drm", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
											]);
										}
									}
									const StreamInfo = new StreamInfo$Type();
									class DashVideo$Type extends MessageType {
										constructor() {
											super("bilibili.playershared.DashVideo", [
												{ no: 1, name: "base_url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 2, name: "backup_url", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
												{ no: 3, name: "bandwidth", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
												{ no: 4, name: "codecid", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
												{ no: 5, name: "md5", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 6, name: "size", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
												{ no: 7, name: "audio_id", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
												{ no: 8, name: "no_rexcode", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
												{ no: 9, name: "frame_rate", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 10, name: "width", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
												{ no: 11, name: "height", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
												{ no: 12, name: "widevine_pssh", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
											]);
										}
									}
									const DashVideo = new DashVideo$Type();
									class FragmentVideo$Type extends MessageType {
										constructor() {
											super("bilibili.playershared.FragmentVideo", [{ no: 1, name: "videos", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => FragmentVideoInfo }]);
										}
									}
									const FragmentVideo = new FragmentVideo$Type();
									class FragmentVideoInfo$Type extends MessageType {
										constructor() {
											super("bilibili.playershared.FragmentVideoInfo", [
												//{ no: 1, name: "fragment_info", kind: "message", T: () => FragmentInfo },
												{ no: 2, name: "vod_info", kind: "message", T: () => VodInfo },
												//{ no: 3, name: "play_arc_conf", kind: "message", T: () => PlayArcConf },
												//{ no: 4, name: "dimension", kind: "message", T: () => Dimension },
												{ no: 5, name: "timelength", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 2 /*LongType.NUMBER*/ },
												//{ no: 6, name: "video_type", kind: "enum", T: () => ["bilibili.playershared.BizType", BizType, "BIZ_TYPE_"] },
												{ no: 7, name: "playable_status", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
											]);
										}
									}
									const FragmentVideoInfo = new FragmentVideoInfo$Type();
									class ResponseUrl$Type extends MessageType {
										constructor() {
											super("bilibili.playershared.ResponseUrl", [
												{ no: 1, name: "order", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
												{ no: 2, name: "length", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
												{ no: 3, name: "size", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
												{ no: 4, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 5, name: "backup_url", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
												{ no: 6, name: "md5", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
											]);
										}
									}
									const ResponseUrl = new ResponseUrl$Type();
									class SegmentVideo$Type extends MessageType {
										constructor() {
											super("bilibili.playershared.SegmentVideo", [{ no: 1, name: "segment", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ResponseUrl }]);
										}
									}
									const SegmentVideo = new SegmentVideo$Type();
									class VodInfo$Type extends MessageType {
										constructor() {
											super("bilibili.playershared.VodInfo", [
												{ no: 1, name: "quality", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
												{ no: 2, name: "format", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 3, name: "timelength", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
												{ no: 4, name: "video_codecid", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
												{ no: 5, name: "stream_list", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => Stream },
												//{ no: 6, name: "dash_audio", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => DashItem },
												//{ no: 7, name: "dolby", kind: "message", T: () => DolbyItem },
												//{ no: 8, name: "volume", kind: "message", T: () => VolumeInfo },
												//{ no: 9, name: "loss_less_item", kind: "message", T: () => LossLessItem },
												//{ no: 10, name: "support_project", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
											]);
										}
									}
									const VodInfo = new VodInfo$Type();
									/******************  initialization finish  *******************/
									switch (PATHs?.[1]) {
										case "PlayViewUnite": {
											// 播放页
											/******************  initialization start  *******************/
											class PlayViewUniteReply$Type extends MessageType {
												constructor() {
													super("bilibili.app.playerunite.v1.PlayViewUniteReply", [
														{ no: 1, name: "vod_info", kind: "message", T: () => VodInfo },
														//{ no: 2, name: "play_arc_conf", kind: "message", T: () => PlayArcConf },
														//{ no: 3, name: "play_device_conf", kind: "message", T: () => PlayDeviceConf },
														//{ no: 4, name: "event", kind: "message", T: () => Event },
														//{ no: 5, name: "supplement", kind: "message", T: () => Any },
														//{ no: 6, name: "play_arc", kind: "message", T: () => PlayArc },
														//{ no: 7, name: "qn_trial_info", kind: "message", T: () => QnTrialInfo },
														//{ no: 8, name: "history", kind: "message", T: () => History },
														//{ no: 9, name: "view_info", kind: "message", T: () => ViewInfo },
														{ no: 10, name: "fragment_video", kind: "message", T: () => FragmentVideo },
													]);
												}
											}
											const PlayViewUniteReply = new PlayViewUniteReply$Type();
											/******************  initialization finish  *******************/
											let data = PlayViewUniteReply.fromBinary(body);
											Console.debug(`data: ${JSON.stringify(data)}`, "");
											let UF = UnknownFieldHandler.list(data);
											//Console.debug(`UF: ${JSON.stringify(UF)}`, "");
											if (UF) {
												UF = UF.map(uf => {
													//uf.no; // 22
													//uf.wireType; // WireType.Varint
													// use the binary reader to decode the raw data:
													let reader = new BinaryReader(uf.data);
													let addedNumber = reader.int32(); // 7777
													Console.debug(`no: ${uf.no}, wireType: ${uf.wireType}, addedNumber: ${addedNumber}`, "");
												});
											}
											data.vodInfo.streamList = data.vodInfo.streamList.map(stream => {
												switch (stream?.content?.oneofKind) {
													case "dashVideo":
														stream.content.dashVideo.baseUrl = stream.content.dashVideo.backupUrl.at(-1);
														break;
													case "SegmentVideo":
														stream.content.segmentVideo.segment = stream.content.segmentVideo.segment.map(segment => {
															segment.url = segment.backupUrl.at(-1);
															return segment;
														});
														break;
												}
												return stream;
											});
											Console.debug(`data: ${JSON.stringify(data)}`, "");
											body = PlayViewUniteReply.toBinary(data);
											break;
										}
									}
									break;
								}
								case "bilibili.app.playurl.v1.PlayURL": // 普通视频
									/******************  initialization start  *******************/
									/******************  initialization finish  *******************/
									switch (PATHs?.[1]) {
										case "PlayView": // 播放地址
											break;
										case "PlayConf": // 播放配置
											break;
									}
									break;
								case "bilibili.pgc.gateway.player.v2.PlayURL": // 番剧
									/******************  initialization start  *******************/
									/******************  initialization finish  *******************/
									infoGroup.type = "PGC";
									switch (PATHs?.[1]) {
										case "PlayView": // 播放地址
											/******************  initialization start  *******************/
											/******************  initialization finish  *******************/
											break;
										case "PlayConf": // 播放配置
											break;
									}
									break;
								case "bilibili.app.nativeact.v1.NativeAct": // 活动-节目、动画、韩综（港澳台）
									switch (PATHs?.[1]) {
										case "Index": // 首页
											break;
									}
									break;
								case "bilibili.app.interface.v1.Search": // 搜索框
									switch (PATHs?.[1]) {
										case "Suggest3": // 搜索建议
											break;
									}
									break;
								case "bilibili.polymer.app.search.v1.Search": // 搜索结果
									/******************  initialization start  *******************/
									/******************  initialization finish  *******************/
									switch (PATHs?.[1]) {
										case "SearchAll": {
											// 全部结果（综合）
											/******************  initialization start  *******************/
											/******************  initialization finish  *******************/
											break;
										}
										case "SearchByType": {
											// 分类结果（番剧、用户、影视、专栏）
											break;
										}
									}
									break;
							}
							break;
					}
					rawBody = gRPC.encode(rawBody);
					break;
			}
			// 写入二进制数据
			$response.body = rawBody;
			break;
		}
	}
	Console.debug(`信息组, infoGroup: ${JSON.stringify(infoGroup)}`, "");
})()
	.catch(e => Console.error(e))
	.finally(() => done($response));
