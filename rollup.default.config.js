import json from '@rollup/plugin-json';
import commonjs from "@rollup/plugin-commonjs";
import terser from '@rollup/plugin-terser';

export default [
	{
		input: 'src/BiliBili.Redirect.request.js',
		output: {
			file: 'js/BiliBili.Redirect.request.js',
			format: 'es',
			banner: '/* README: https://github.com/BiliUniverse */',
		},
		plugins: [json(), commonjs(), terser()]
	},
];
