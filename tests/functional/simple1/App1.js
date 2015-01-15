// jshint unused:false, undef:false, quotmark:false
require(["dapp/Application", "requirejs-text/text!./config.json"],
	function (Application, config) {
		//	register.parse(document.getElementById("divToParse"));
		var jsonData = config;
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		new Application(JSON.parse(jsonData)).then(function (app) {
			// This is the setup to start the functional test, and make the app available to the test
			console.log("promise resolved for new App [" + app.id + "] it should be started and default views shown");
			ready = true; // set global ready to start the test
		});
	});
