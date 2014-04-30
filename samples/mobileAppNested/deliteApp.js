// jshint unused:false, undef:false, quotmark:false
require(["dapp/main", //"dojo/json",
		"requirejs-text/text!./config.json",
		/*"requirejs-text/text!./dapp/samples/mobileAppNested/config.json",*/
		"dojo/sniff"
	],
	function (Application, /*json,*/ config, has) {
		/* jshint nonew: false */
		has.add("requirejs", window.requirejs);
		var jsonData = config;
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		//jsonData = JSON.minify(jsonData);
		//new Application(json.parse(config));
		new Application(JSON.parse(jsonData));
	});
