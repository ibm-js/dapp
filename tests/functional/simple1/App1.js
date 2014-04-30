// jshint unused:false, undef:false, quotmark:false
require(["dapp/main", "dojo/json", "requirejs-text/text!./config.json", "dojo/sniff"],
	function (Application, json, config, has) {
		has.add("requirejs", window.requirejs);
		/* jshint nonew: false */

		//	register.parse(document.getElementById("divToParse"));
		var jsonData = config;
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		//new Application(JSON.parse(jsonData));
		var appDeferred = new Application(JSON.parse(jsonData));
		appDeferred.then(function (app) {
			// This is the setup to start the functional test, and make the app available to the test
			console.log("deferred resolved for new App [" + app.id + "] it should be started and default views shown");
			ready = true; // set global ready to start the test
		});
	});
