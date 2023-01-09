const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

let mode = 'development';
if (process.env.NODE_ENV === 'production'){
	mode = 'production';
}
module.exports = {
	devtool: 'source-map',
	devServer: {
		static: './dist',
		hot: true,
	},
	entry: './src/index.ts',
	mode,
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				}
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader', 'postcss-loader'],
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	plugins: [new HtmlWebpackPlugin({
		title: 'Battleship'
	})],
};