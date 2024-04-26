import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";

import Database from "./database/BiliBili.mjs";
import setENV from "./function/setENV.mjs";
import addgRPCHeader from "./function/addgRPCHeader.mjs";

import pako from "../node_modules/pako/dist/pako.esm.mjs";
import { WireType, UnknownFieldHandler, reflectionMergePartial, MESSAGE_TYPE, MessageType, BinaryReader, isJsonObject, typeofJsonValue, jsonWriteOptions } from "../node_modules/@protobuf-ts/runtime/build/es2015/index.js";
// import { Any } from "./protobuf/google/protobuf/any.js";

const $ = new ENV("📺 BiliBili: 🌐 Redirect v0.3.0(2007) repsonse.beta");

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname, PATHs = url.pathname.split("/").filter(Boolean);
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	// 读取设置
	const { Settings, Caches, Configs } = setENV("BiliBili", "Redirect", Database);
	$.log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = { "code": 0, "message": "0", "data": {} };
			// 信息组
			let infoGroup = {
				"seasonTitle": url.searchParams.get("season_title"),
				"seasonId": parseInt(url.searchParams.get("season_id"), 10) || undefined,
				"epId": parseInt(url.searchParams.get("ep_id"), 10) || undefined,
				"mId": parseInt(url.searchParams.get("mid") || url.searchParams.get("vmid"), 10) || undefined,
				"evaluate": undefined,
				"keyword": url.searchParams.get("keyword"),
				"locale": url.searchParams.get("locale"),
				"locales": [],
				"type": "UGC"
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
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					//body = XML.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = XML.stringify(body);
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($response.body);
					//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
					//$response.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					body = JSON.parse($response.body ?? "{}");
					// 解析链接
					switch (HOST) {
						case "www.bilibili.com":
							break;
						case "app.bilibili.com":
						case "app.biliapi.net":
							break;
						case "api.bilibili.com":
						case "api.biliapi.net":
							switch (PATH) {
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
									};
									break;
								case "/pgc/view/v2/app/season": // 番剧页面-内容-app
									break;
								case "/pgc/view/web/season": // 番剧-内容-web
								case "/pgc/view/pc/season": // 番剧-内容-pc
									break;
							};
							break;
					};
					$response.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream":
					//$.log(`🚧 $response.body: ${JSON.stringify($response.body)}`, "");
					let rawBody = $.isQuanX() ? new Uint8Array($response.bodyBytes ?? []) : $response.body ?? new Uint8Array();
					//$.log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
					switch (FORMAT) {
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
							break;
						case "application/grpc":
						case "application/grpc+proto":
							// 先拆分B站gRPC校验头和protobuf数据体
							let header = rawBody.slice(0, 5);
							body = rawBody.slice(5);
							// 处理response压缩protobuf数据体
							switch (header?.[0]) {
								case 0: // unGzip
									break;
								case 1: // Gzip
									body = pako.ungzip(body);
									header[0] = 0; // unGzip
									break;
							};
							// 解析链接并处理protobuf数据
							switch (HOST) {
								case "grpc.biliapi.net": // HTTP/2
								case "app.bilibili.com": // HTTP/1.1
									/******************  initialization start  *******************/
									// protobuf/google/protobuf/any.proto
									class Any$Type extends MessageType {
										constructor() {
											super("google.protobuf.Any", [
												{ no: 1, name: "type_url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
												{ no: 2, name: "value", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
											]);
										}
										/**
										 * Pack the message into a new `Any`.
										 *
										 * Uses 'type.googleapis.com/full.type.name' as the type URL.
										 */
										pack(message, type) {
											return {
												typeUrl: this.typeNameToUrl(type.typeName), value: type.toBinary(message),
											};
										}
										/**
										 * Unpack the message from the `Any`.
										 */
										unpack(any, type, options) {
											if (!this.contains(any, type))
												throw new Error("Cannot unpack google.protobuf.Any with typeUrl '" + any.typeUrl + "' as " + type.typeName + ".");
											return type.fromBinary(any.value, options);
										}
										/**
										 * Does the given `Any` contain a packed message of the given type?
										 */
										contains(any, type) {
											if (!any.typeUrl.length)
												return false;
											let wants = typeof type == "string" ? type : type.typeName;
											let has = this.typeUrlToName(any.typeUrl);
											return wants === has;
										}
										/**
										 * Convert the message to canonical JSON value.
										 *
										 * You have to provide the `typeRegistry` option so that the
										 * packed message can be converted to JSON.
										 *
										 * The `typeRegistry` option is also required to read
										 * `google.protobuf.Any` from JSON format.
										 */
										internalJsonWrite(any, options) {
											if (any.typeUrl === "")
												return {};
											let typeName = this.typeUrlToName(any.typeUrl);
											let opt = jsonWriteOptions(options);
											let type = opt.typeRegistry?.find(t => t.typeName === typeName);
											if (!type)
												throw new globalThis.Error("Unable to convert google.protobuf.Any with typeUrl '" + any.typeUrl + "' to JSON. The specified type " + typeName + " is not available in the type registry.");
											let value = type.fromBinary(any.value, { readUnknownField: false });
											let json = type.internalJsonWrite(value, opt);
											if (typeName.startsWith("google.protobuf.") || !isJsonObject(json))
												json = { value: json };
											json["@type"] = any.typeUrl;
											return json;
										}
										internalJsonRead(json, options, target) {
											if (!isJsonObject(json))
												throw new globalThis.Error("Unable to parse google.protobuf.Any from JSON " + typeofJsonValue(json) + ".");
											if (typeof json["@type"] != "string" || json["@type"] == "")
												return this.create();
											let typeName = this.typeUrlToName(json["@type"]);
											let type = options?.typeRegistry?.find(t => t.typeName == typeName);
											if (!type)
												throw new globalThis.Error("Unable to parse google.protobuf.Any from JSON. The specified type " + typeName + " is not available in the type registry.");
											let value;
											if (typeName.startsWith("google.protobuf.") && json.hasOwnProperty("value"))
												value = type.fromJson(json["value"], options);
											else {
												let copy = Object.assign({}, json);
												delete copy["@type"];
												value = type.fromJson(copy, options);
											}
											if (target === undefined)
												target = this.create();
											target.typeUrl = json["@type"];
											target.value = type.toBinary(value);
											return target;
										}
										typeNameToUrl(name) {
											if (!name.length)
												throw new Error("invalid type name: " + name);
											return "type.googleapis.com/" + name;
										}
										typeUrlToName(url) {
											if (!url.length)
												throw new Error("invalid type url: " + url);
											let slash = url.lastIndexOf("/");
											let name = slash > 0 ? url.substring(slash + 1) : url;
											if (!name.length)
												throw new Error("invalid type url: " + url);
											return name;
										}
									}
									const Any = new Any$Type();
									/******************  initialization finish  *******************/
									switch (PATHs?.[0]) {
										case "bilibili.app.viewunite.v1.View":
											/******************  initialization start  *******************/
											/******************  initialization finish  *******************/
											switch (PATHs?.[1]) {
												case "View": // 播放页
													break;
											};
											break;
										case "bilibili.app.playerunite.v1.Player":
											/******************  initialization start  *******************/
											class Stream$Type extends MessageType {
												constructor() {
													super("bilibili.playershared.Stream", [
														{ no: 1, name: "stream_info", kind: "message", T: () => StreamInfo },
														{ no: 2, name: "dash_video", kind: "message", oneof: "content", T: () => DashVideo },
														{ no: 3, name: "segment_video", kind: "message", oneof: "content", T: () => SegmentVideo }
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
														{ no: 10, name: "attribute", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
														{ no: 11, name: "new_description", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 12, name: "display_desc", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 13, name: "superscript", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 14, name: "vip_free", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
														{ no: 15, name: "subtitle", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														//{ no: 16, name: "scheme", kind: "message", T: () => Scheme },
														{ no: 17, name: "support_drm", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
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
														{ no: 6, name: "size", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
														{ no: 7, name: "audio_id", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 8, name: "no_rexcode", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
														{ no: 9, name: "frame_rate", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 10, name: "width", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
														{ no: 11, name: "height", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
														{ no: 12, name: "widevine_pssh", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const DashVideo = new DashVideo$Type();
											class SegmentVideo$Type extends MessageType {
												constructor() {
													super("bilibili.playershared.SegmentVideo", [
														{ no: 1, name: "segment", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ResponseUrl }
													]);
												}
											}
											const SegmentVideo = new SegmentVideo$Type();
											class ResponseUrl$Type extends MessageType {
												constructor() {
													super("bilibili.playershared.ResponseUrl", [
														{ no: 1, name: "order", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
														{ no: 2, name: "length", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
														{ no: 3, name: "size", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ },
														{ no: 4, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
														{ no: 5, name: "backup_url", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
														{ no: 6, name: "md5", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
													]);
												}
											}
											const ResponseUrl = new ResponseUrl$Type();
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
														//{ no: 9, name: "loss_less_item", kind: "message", T: () => LossLessItem }
													]);
												}
											}
											const VodInfo = new VodInfo$Type();
											/******************  initialization finish  *******************/
											switch (PATHs?.[1]) {
												case "PlayViewUnite": // 播放页
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
																//{ no: 8, name: "history", kind: "message", T: () => History }
															]);
														}
													}
													const PlayViewUniteReply = new PlayViewUniteReply$Type();
													/******************  initialization finish  *******************/
													let data = PlayViewUniteReply.fromBinary(body);
													$.log(`🚧 data: ${JSON.stringify(data)}`, "");
													let UF = UnknownFieldHandler.list(data);
													//$.log(`🚧 UF: ${JSON.stringify(UF)}`, "");
													if (UF) {
														UF = UF.map(uf => {
															//uf.no; // 22
															//uf.wireType; // WireType.Varint
															// use the binary reader to decode the raw data:
															let reader = new BinaryReader(uf.data);
															let addedNumber = reader.int32(); // 7777
															$.log(`🚧 no: ${uf.no}, wireType: ${uf.wireType}, addedNumber: ${addedNumber}`, "");
														});
													};
													$.log(`🚧 data: ${JSON.stringify(data)}`, "");
													body = PlayViewUniteReply.toBinary(data);
													break;
											};
											break;
										case "bilibili.app.playurl.v1.PlayURL": // 普通视频
											/******************  initialization start  *******************/
											/******************  initialization finish  *******************/
											switch (PATHs?.[1]) {
												case "PlayView": // 播放地址
													break;
												case "PlayConf": // 播放配置
													break;
											};
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
											};
											break;
										case "bilibili.app.nativeact.v1.NativeAct": // 活动-节目、动画、韩综（港澳台）
											switch (PATHs?.[1]) {
												case "Index": // 首页
													break;
											};
											break;
										case "bilibili.app.interface.v1.Search": // 搜索框
											switch (PATHs?.[1]) {
												case "Suggest3": // 搜索建议
													break;
											};
											break;
										case "bilibili.polymer.app.search.v1.Search": // 搜索结果
											/******************  initialization start  *******************/
											/******************  initialization finish  *******************/
											switch (PATHs?.[1]) {
												case "SearchAll": { // 全部结果（综合）
													/******************  initialization start  *******************/
													/******************  initialization finish  *******************/
													break;
												};
												case "SearchByType": { // 分类结果（番剧、用户、影视、专栏）
													break;
												};
											};
											break;
									};
									break;
							};
							// protobuf部分处理完后，重新计算并添加B站gRPC校验头
							rawBody = addgRPCHeader({ header, body }); // gzip压缩有问题，别用
							break;
					};
					// 写入二进制数据
					$response.body = rawBody;
					break;
			};
			$.log(`🚧 ${$.name}，信息组, infoGroup: ${JSON.stringify(infoGroup)}`, "");
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done($response))
