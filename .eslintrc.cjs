module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
		'node': true
	},
	'ignorePatterns': [
		'*.config.js',
		'node_modules',
		'dist',
	],
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended'
	],
	'overrides': [
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module'
	},
	'plugins': [
		'@typescript-eslint'
	],
	'rules': {
		'indent': [
			'error',
			'tab', 
			{
				'SwitchCase': 1,
			}
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'no-console': ['error']
	}
};
