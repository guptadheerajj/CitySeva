const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");

// Load environment variables from .env file
const env = dotenv.config().parsed || {};

// Convert environment variables to string format for webpack
const envKeys = Object.keys(env).reduce((prev, next) => {
	prev[`process.env.${next}`] = JSON.stringify(env[next]);
	return prev;
}, {});

module.exports = {
	entry: "./src/main.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
		publicPath: "/",
	},
	resolve: {
		fallback: {
			"path": false,
			"os": false,
			"crypto": false,
			"fs": false,
		}
	},	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/pages/landing/template.html",
		}),
		// Add environment variables to the bundle
		new webpack.DefinePlugin({
			'process.env': JSON.stringify(process.env),
			...envKeys,
		}),
		// Provide a global process object
		new webpack.ProvidePlugin({
			process: 'process/browser',
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
