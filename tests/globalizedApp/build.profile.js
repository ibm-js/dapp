/* jshint unused: false */
require(["dapp/build/buildControlApp"], function (bc) {
});

var profile = {
	basePath: "..",
	releaseDir: "./globalizedApp/release",
	action: "release",
	cssOptimize: "comments",
	packages: [
		{
			name: "dojo",
			location: "../../../dojo"
		},
		{
			name: "dijit",
			location: "../../../dijit"
		},
		{
			name: "globalizedApp",
			location: "../../../dapp/tests/globalizedApp",
			destLocation: "./dapp/tests/globalizedApp"
		},
		{
			name: "dojox",
			location: "../../../dojox"
		}
	],
	layers: {
		"globalizedApp/globalizedApp": {
			include: [ "globalizedApp/index.html" ]
		}
	}
};



