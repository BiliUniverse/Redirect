import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";

export default [
	{
		input: 'src/BiliBili.Redirect.request.beta.js',
		output: {
			file: 'js/BiliBili.Redirect.request.beta.js',
			format: 'es',
			banner: '/* README: https://github.com/BiliUniverse */',
		},
		plugins: [json(), commonjs()]
	},
	{
		input: 'src/BiliBili.Redirect.response.beta.js',
		output: {
			file: 'js/BiliBili.Redirect.response.beta.js',
			format: 'es',
			banner: '/* README: https://github.com/BiliUniverse */',
		},
		plugins: [json(), commonjs()]
	},
];
