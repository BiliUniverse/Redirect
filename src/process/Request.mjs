import { URL } from "@nsnanocat/url";
import { $app, Console } from "@nsnanocat/util";
import database from "../function/database.mjs";
import setENV from "../function/setENV.mjs";
/***************** Processing *****************/
export async function Request($request) {
	let $response;
	// 解构URL
	const url = new URL($request.url);
	Console.info(`url: ${url.toJSON()}`);
	// 获取连接参数
	const PATHs = url.pathname.split("/").filter(Boolean);
	Console.info(`PATHs: ${PATHs}`);
	// 解析格式
	const FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
	Console.info(`FORMAT: ${FORMAT}`);
	/**
	 * 设置
	 * @type {{Settings: import('../types').Settings}}
	 */
	const { Settings } = setENV("BiliBili", "Redirect", database);
	Console.logLevel = Settings.LogLevel;
	const originalHostname = url.hostname;
	// 方法判断
	switch ($request.method) {
		case "POST":
		case "PUT":
		case "PATCH":
		// 先解码请求正文，再继续处理 URL。
		// Decode request bodies before continuing with URL processing.
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
					//Console.debug(`body: ${JSON.stringify(body)}`);
					//$request.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					//body = XML.parse($request.body);
					//Console.debug(`body: ${JSON.stringify(body)}`);
					//$request.body = XML.stringify(body);
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($request.body);
					//Console.debug(`body: ${JSON.stringify(body)}`);
					//$request.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					//body = JSON.parse($request.body ?? "{}");
					//Console.debug(`body: ${JSON.stringify(body)}`);
					//$request.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/vnd.apple.flatbuffer":
				case "application/octet-stream": {
					//Console.debug(`$request.body: ${JSON.stringify($request.body)}`);
					const rawBody = $app === "Quantumult X" ? new Uint8Array($request.bodyBytes ?? []) : ($request.body ?? new Uint8Array());
					//Console.debug(`isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`);
					switch (FORMAT) {
						case "application/protobuf":
						case "application/x-protobuf":
						case "application/vnd.google.protobuf":
							break;
						case "application/grpc":
						case "application/grpc+proto":
							break;
					}
					// 写入二进制数据
					$request.body = rawBody;
					break;
				}
			}
		//break; // 不中断，继续处理URL
		case "GET":
		case "HEAD":
		case "OPTIONS":
		default:
			// 主机判断
			switch (url.hostname) {
				case "upos-sz-mirrorali.bilivideo.com": // 阿里云 CDN
				case "upos-sz-mirrorali02.bilivideo.com": // 阿里云 CDN
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
					break;
				case "upos-hz-mirrorakam.akamaized.net": // Akamai CDN，海外，有参数校验，其他类型的 CDN 不能直接替换为此 Host。但反过来可以。
				case "upos-sz-mirrorakam.akamaized.net": // Akamai CDN，海外，有参数校验，其他类型的 CDN 不能直接替换为此 Host。但反过来可以。
				case "upos-sz-mirrorawsov.bilivideo.com": // AWS CDN，海外
				case "upos-sz-mirroraliov.bilivideo.com": // 阿里云 CDN，海外
				case "upos-sz-mirrorcosov.bilivideo.com": // 腾讯云 CDN，海外
				case "upos-sz-mirrorhwov.bilivideo.com": // 华为云 CDN，海外
					url.hostname = Settings.Host.OverseaVideo;
					url.port = "";
					break;
				case "upos-sz-mirroralibstar1.bilivideo.com": // 阿里云 CDN，海外（东南亚），其他类型的 CDN 应该不能替换为此 Host，但反过来可以。
				case "upos-sz-mirrorcosbstar1.bilivideo.com": // 腾讯云 CDN，海外（东南亚），其他类型的 CDN 应该不能替换为此 Host，但反过来可以。
				case "upos-sz-mirrorhwbstar1.bilivideo.com": // 华为云 CDN，海外（东南亚），其他类型的 CDN 应该不能替换为此 Host，但反过来可以。
				case "upos-bstar1-mirrorakam.akamaized.net": // Akamai CDN，海外（东南亚），有参数校验，其他类型的 CDN 不能直接替换为此 Host。但反过来可以。
					url.hostname = Settings.Host.BStar;
					url.port = "";
					break;
				default:
					if (url.hostname.startsWith("upos-sz-mirror") && url.hostname.endsWith("ov.bilivideo.com")) {
						url.hostname = Settings.Host.OverseaVideo;
						url.port = "";
						break;
					}
					if (url.hostname.startsWith("cn-hk-eq-") && url.hostname.endsWith(".bilivideo.com")) {
						url.hostname = Settings.Host.OverseaVideo;
						url.port = "";
						break;
					}
					if (url.hostname.startsWith("upos-sz-mirror") && url.hostname.endsWith("bstar1.bilivideo.com")) {
						url.hostname = Settings.Host.BStar;
						url.port = "";
						break;
					}
					switch (url.port) {
						case "": {
							switch (true) {
								case url.hostname.endsWith(".mcdn.bilivideo.cn"):
									switch (true) {
										case url.pathname.startsWith("/v1/resource/"):
											switch (url.protocol) {
												case "http:":
													url.port = "8000";
													break;
												case "https:":
													url.port = "8082";
													break;
											}
											break;
										case url.pathname.startsWith("/upgcxcode/"):
											switch (url.protocol) {
												case "http:":
													url.port = "9102";
													break;
												case "https:":
													url.port = "4483";
													break;
											}
											break;
									}
									break;
							}
							break;
						}
						case "486": {
							// MCDN
							const cdn = url.searchParams.get("cdn");
							const sid = url.searchParams.get("sid");
							if (cdn) {
								url.hostname = `d1--${cdn}.bilivideo.com`;
								url.port = "";
							} else if (sid) {
								url.hostname = `${sid}.bilivideo.com`;
								url.port = "";
							}
							break;
						}
						case "4480": // PCDN
							url.protocol = "http:";
							url.hostname = url.searchParams.get("xy_usource") || Settings.Host.PCDN;
							url.port = "";
							break;
						case "8000": // MCDN.v1.resource
						case "8082": // MCDN.v1.resource
							break;
						case "4483": // MCDN.upgcxcode
						case "9102": // MCDN.upgcxcode
							if (url.hostname.endsWith(".bilivideo.com")) break;
							if (url.searchParams.has("originalUrl")) break; // 跳过 MCDN 重定向
							url.protocol = "http:";
							url.hostname = Settings.Host.MCDN;
							url.port = "";
							url.pathname = "";
							url.search = "";
							url.searchParams.set("url", $request.url);
							break;
						case "9305": // PCDN
							url.protocol = "http:";
							url.hostname = PATHs.shift();
							url.port = "";
							url.pathname = PATHs.join("/");
							break;
					}
					break;
			}
			break;
		case "CONNECT":
		case "TRACE":
			break;
	}
	$request.url = url.toString();
	if (url.hostname !== originalHostname) {
		if ($request.headers?.Host) $request.headers.Host = url.hostname;
		if ($request.headers?.[":authority"]) $request.headers[":authority"] = url.hostname;
	}
	Console.debug(`$request.url: ${$request.url}`);
	return { $request, $response };
}
