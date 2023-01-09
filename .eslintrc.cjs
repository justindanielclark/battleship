module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
		'node': true
	},
	'ignorePatterns': [
		'*.config.js',
		'*.config.json',
		'node_modules',
		'dist',
		'.prettierignore',
		'.prettierrc.json',
		'package-lock.json',
		'package.json',
	],
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
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
		'semi': [
			'error',
			'always'
		],
		'no-console': ['error']
	}
};
