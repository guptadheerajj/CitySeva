const path = require("path");
const { merge } = require("webpack-merge");
const commoon = require("./webpack.common.js");

module.exports = merge(commoon, {
	mode: "production",
	devtool: "source-map",
});
