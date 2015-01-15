/* global requirejs */
requirejs.config({
	paths: {
		"dapp": "../../../../../dapp",
		"dcl": "../../../../../dcl",
		"dojo": "../../../../../dojo",
		"dpointer": "../../../../../dpointer",
		"decor": "../../../../../decor",
		"delite": "../../../../../delite",
		"deliteful": "../../../../../deliteful",
		"lie": "../../../../../lie",
		"requirejs": "../../../../../requirejs",
		"requirejs-text": "../../../../../requirejs-text",
		"requirejs-dplugins": "../../../../../requirejs-dplugins",
		"requirejs-domready": "../../../../../requirejs-domready",

		"jquery.mobile": "https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min",
		"jquery.mobile.css": "http://code.jquery.com/mobile/1.4.4/",

		// this works when running dapp/tests/unit/jqm/hideViewJqm
		"jquery": "../../../../../jquery/dist/jquery"

		// this works when running dapp/tests/unit/jqm/hideViewJqm
		//"jquery": "https://code.jquery.com/jquery-2.1.1.min"
	},
	shim: {
		"jquery.mobile": {
			deps: ["jquery"],
			exports: "mobile"
		}
	},
	waitSeconds: 45
});
