const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
	mode: "development",
	devtool: "eval-source-map",
	devServer: {
		historyApiFallback: true,
		hot: true,
		port: 8080,
		static: {
			directory: path.join(__dirname, "dist"),
		},
	},
});
