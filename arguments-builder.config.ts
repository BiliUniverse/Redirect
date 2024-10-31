import { defineConfig } from "@iringo/arguments-builder";

export default defineConfig({
	output: {
		surge: {
			path: "./dist/BiliBili.Redirect.sgmodule",
		},
		loon: {
			path: "./dist/BiliBili.Redirect.plugin",
		},
		customItems: [
			{
				path: "./dist/BiliBili.Redirect.stoverride",
				template: "./template/stash.handlebars",
			},
			{
				path: "./dist/BiliBili.Redirect.yaml",
				template: "./template/egern.handlebars",
			},
		],
		dts: {
			isExported: true,
			path: "./src/types.d.ts",
		},
		boxjsSettings: {
			path: "./template/boxjs.settings.json",
			scope: "@BiliBili.Redirect.Settings",
		},
	},
	args: [
		{
			key: "Switch",
			name: "总功能开关",
			defaultValue: true,
			type: "boolean",
			description: "是否启用此APP修改",
			exclude: ["surge", "loon"],
		},
		{
			key: "Host.Akamaized",
			name: "[主机名] 重定向 Akamaized CDN (港澳台)",
			defaultValue: "upos-sz-mirrorali.bilivideo.com",
			type: "string",
			boxJsType: "selects",
			description: "请选择 Akamaized 要重定向的主机名。",
			options: [
				{
					"key": "upos-sz-mirrorali.bilivideo.com",
					"label": "阿里云 CDN"
				},
				{
					"key": "upos-sz-mirrorcos.bilivideo.com",
					"label": "腾讯云 CDN"
				},
				{
					"key": "upos-sz-mirrorhw.bilivideo.com",
					"label": "华为云 CDN，融合 CDN"
				},
				{
					"key": "upos-sz-mirroraliov.bilivideo.com",
					"label": "阿里云 CDN，海外"
				},
				{
					"key": "upos-sz-mirrorcosov.bilivideo.com",
					"label": "腾讯云 CDN，海外"
				},
				{
					"key": "upos-sz-mirrorhwov.bilivideo.com",
					"label": "华为云 CDN，海外"
				}
			],
		},
		{
			key: "Host.BStar",
			name: "[主机名] 重定向 BStar CDN (国际版)",
			defaultValue: "upos-sz-mirrorali.bilivideo.com",
			type: "string",
			boxJsType: "selects",
			description: "请选择 BStar 要重定向的主机名。",
			options: [
				{
					"key": "upos-sz-mirrorali.bilivideo.com",
					"label": "阿里云 CDN"
				},
				{
					"key": "upos-sz-mirrorcos.bilivideo.com",
					"label": "腾讯云 CDN"
				},
				{
					"key": "upos-sz-mirrorhw.bilivideo.com",
					"label": "华为云 CDN，融合 CDN"
				},
				{
					"key": "upos-sz-mirroraliov.bilivideo.com",
					"label": "阿里云 CDN，海外"
				},
				{
					"key": "upos-sz-mirrorcosov.bilivideo.com",
					"label": "腾讯云 CDN，海外"
				},
				{
					"key": "upos-sz-mirrorhwov.bilivideo.com",
					"label": "华为云 CDN，海外"
				}
			],
		},
		{
			key: "Host.PCDN",
			name: "[主机名] 重定向 PCDN 主机名 (中国大陆)",
			defaultValue: "upos-sz-mirrorali.bilivideo.com",
			type: "string",
			boxJsType: "selects",
			description: "请选择 PCDN 要重定向的主机名。",
			options: [
				{
					"key": "upos-sz-mirrorali.bilivideo.com",
					"label": "阿里云 CDN"
				},
				{
					"key": "upos-sz-mirrorcos.bilivideo.com",
					"label": "腾讯云 CDN"
				},
				{
					"key": "upos-sz-mirrorhw.bilivideo.com",
					"label": "华为云 CDN，融合 CDN"
				},
				{
					"key": "upos-sz-mirroraliov.bilivideo.com",
					"label": "阿里云 CDN，海外"
				},
				{
					"key": "upos-sz-mirrorcosov.bilivideo.com",
					"label": "腾讯云 CDN，海外"
				},
				{
					"key": "upos-sz-mirrorhwov.bilivideo.com",
					"label": "华为云 CDN，海外"
				}
			],
		},
		{
			key: "Host.MCDN",
			name: "[主机名] 重定向 MCDN 主机名 (中国大陆)",
			defaultValue: "proxy-tf-all-ws.bilivideo.com",
			type: "string",
			boxJsType: "selects",
			description: "请选择 MCDN 要重定向的主机名。",
			options: [
				{
					"key": "proxy-tf-all-ws.bilivideo.com",
					"label": "proxy-tf-all-ws.bilivideo.com"
				}
			],
		},
	],
});
