import _ from './ENV/Lodash.mjs'
import $Storage from './ENV/$Storage.mjs'
import ENV from "./ENV/ENV.mjs";

import Database from "./database/BiliBili.mjs";
import setENV from "./function/setENV.mjs";

const $ = new ENV("📺 BiliBili: 🔀 Redirect v0.2.0(8) request");

// 构造回复数据
let $response = undefined;

/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
//$.log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method, HOST = url.hostname, PATH = url.pathname, PATHs = url.pathname.split("/").filter(Boolean);
$.log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}` , "");
// 解析格式
const FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
//$.log(`⚠ FORMAT: ${FORMAT}`, "");
!(async () => {
	// 读取设置
	const { Settings, Caches, Configs } = setENV("BiliBili", "Redirect", Database);
	//$.log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
	switch (Settings.Switch) {
		case true:
		default:
			// 创建空数据
			let body = {};
			// 方法判断
			switch (METHOD) {
				case "POST":
				case "PUT":
				case "PATCH":
				case "DELETE":
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
							//body = M3U8.parse($request.body);
							//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = M3U8.stringify(body);
							break;
						case "text/xml":
						case "text/html":
						case "text/plist":
						case "application/xml":
						case "application/plist":
						case "application/x-plist":
							//body = XML.parse($request.body);
							//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = XML.stringify(body);
							break;
						case "text/vtt":
						case "application/vtt":
							//body = VTT.parse($request.body);
							//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = VTT.stringify(body);
							break;
						case "text/json":
						case "application/json":
							//body = JSON.parse($request.body ?? "{}");
							//$.log(`🚧 body: ${JSON.stringify(body)}`, "");
							//$request.body = JSON.stringify(body);
							break;
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
						case "application/grpc":
						case "application/grpc+proto":
						case "application/octet-stream":
							//$.log(`🚧 $request.body: ${JSON.stringify($request.body)}`, "");
							let rawBody = $.isQuanX() ? new Uint8Array($request.bodyBytes ?? []) : $request.body ?? new Uint8Array();
							//$.log(`🚧 isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`, "");
							switch (FORMAT) {
								case "application/protobuf":
								case "application/x-protobuf":
								case "application/vnd.google.protobuf":
									break;
								case "application/grpc":
								case "application/grpc+proto":
									break;
							};
							// 写入二进制数据
							$request.body = rawBody;
							break;
					};
					//break; // 不中断，继续处理URL
				case "GET":
				case "HEAD":
				case "OPTIONS":
				case undefined: // QX牛逼，script-echo-response不返回method
				default:
					// 主机判断
					switch (HOST) {
						case "upos-sz-mirrorali.bilivideo.com": // 阿里云 CDN
						case "upos-sz-mirroralib.bilivideo.com": // 阿里云 CDN
						case "upos-sz-mirroralio1.bilivideo.com": // 阿里云 CDN
						case "upos-sz-mirrorcos.bilivideo.com": // 腾讯云 CDN
						case "upos-sz-mirrorcosb.bilivideo.com": // 腾讯云 CDN，VOD 加速类型
						case "upos-sz-mirrorcoso1.bilivideo.com": // 腾讯云 CDN
						case "upos-sz-mirrorhw.bilivideo.com": // 华为云 CDN，融合 CDN
						case "upos-sz-mirrorhwb.bilivideo.com": // 华为云 CDN，融合 CDN
						case "upos-sz-mirrorhwo1.bilivideo.com": // 华为云 CDN，融合 CDN
						case "upos-sz-mirror08c.bilivideo.com": // 华为云 CDN，融合 CDN
						case "upos-sz-mirror08h.bilivideo.com": // 华为云 CDN，融合 CDN
						case "upos-sz-mirror08ct.bilivideo.com": // 华为云 CDN，融合 CDN
						case "upos-sz-mirroraliov.bilivideo.com": // 阿里云 CDN，海外
						case "upos-sz-mirrorcosov.bilivideo.com": // 腾讯云 CDN，海外
						case "upos-sz-mirrorhwov.bilivideo.com": // 华为云 CDN，海外
							break;
						case "upos-hz-mirrorakam.akamaized.net": // Akamai CDN，海外，有参数校验，其他类型的 CDN 不能直接替换为此 Host。但反过来可以。
							url.host = Settings.Host.Akamaized;
							break;
						case "upos-sz-mirroralibstar1.bilivideo.com": // 阿里云 CDN，海外（东南亚），其他类型的 CDN 应该不能替换为此 Host，但反过来可以。
						case "upos-sz-mirrorcosbstar1.bilivideo.com": // 腾讯云 CDN，海外（东南亚），其他类型的 CDN 应该不能替换为此 Host，但反过来可以。
						case "upos-sz-mirrorhwbstar1.bilivideo.com": // 华为云 CDN，海外（东南亚），其他类型的 CDN 应该不能替换为此 Host，但反过来可以。
						case "upos-bstar1-mirrorakam.akamaized.net": // Akamai CDN，海外（东南亚），有参数校验，其他类型的 CDN 不能直接替换为此 Host。但反过来可以。
							url.host = Settings.Host.BStar;
							break;
						default:
							switch (url.port) {
								case "4480": // PCDN
									url.protocol = "http";
									url.host = url.searchParams.get("xy_usource") || Settings.Host.PCDN;
									url.port = "";
									break;
								case "4483": // MCDN
								case "8000": // MCDN
								case "8082": // MCDN
								case "9102": // MCDN
									url.protocol = "https";
									url.hostname = "proxy-tf-all-ws.bilivideo.com"
									url.port = "";
									url.pathname = "";
									url.searchParams.set("url", $request.url);
									break;
							};
							break;
					};
					break;
				case "CONNECT":
				case "TRACE":
					break;
			};
			if ($request.headers?.Host) $request.headers.Host = url.host;
			$request.url = url.toString();
			//$.log(`🚧 调试信息`, `$request.url: ${$request.url}`, "");
			break;
		case false:
			break;
	};
})()
	.catch((e) => $.logErr(e))
	.finally(() => {
		switch ($response) {
			default: // 有构造回复数据，返回构造的回复数据
				//$.log(`🚧 finally`, `echo $response: ${JSON.stringify($response, null, 2)}`, "");
				if ($response.headers?.["Content-Encoding"]) $response.headers["Content-Encoding"] = "identity";
				if ($response.headers?.["content-encoding"]) $response.headers["content-encoding"] = "identity";
				if ($.isQuanX()) {
					if (!$response.status) $response.status = "HTTP/1.1 200 OK";
					delete $response.headers?.["Content-Length"];
					delete $response.headers?.["content-length"];
					delete $response.headers?.["Transfer-Encoding"];
					$.done($response);
				} else $.done({ response: $response });
				break;
			case undefined: // 无构造回复数据，发送修改的请求数据
				//$.log(`🚧 finally`, `$request: ${JSON.stringify($request, null, 2)}`, "");
				$.done($request);
				break;
		};
	})

/***************** Function *****************/
