// jshint unused:false, undef:false, quotmark:false
require(["dapp/Application", "requirejs-text/text!./config.json"],
	function (Application, config) {
		// remove single line comments from the config json
		var jsonData = config;
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		new Application(JSON.parse(jsonData)).then(function (app) {
			console.log("promise resolved for new App [" + app.id + "] it should be started and default views shown");
		});
	});
