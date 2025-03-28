// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: "development",
	entry: "./src/main.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
		publicPath: "/"
	},
	devtool: "eval-source-map",
	devServer: {
		historyApiFallback: true,
		hot: true,
		port: 8080,
		static: {
			directory: path.join(__dirname, "dist"),
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/pages/landing/template.html",
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.html$/i,
				loader: "html-loader",
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",
			},
		],
	},
};
