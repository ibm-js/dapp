// jshint unused:false, undef:false, quotmark:false
require(["dojo/_base/window", "dapp/main", "dojo/json", "requirejs-text/text!./app.json", "dojo/sniff"],
	function (win, Application, json, config, has) {
		win.global.dStore1App = {};
		win.global.dStore1App.list1Data = {
			identifier: "id",
			'items': []
		};
		for (i = 1; i < 6; i++) {
			win.global.dStore1App.list1Data.items.push({
				label: "Selection " + i,
				id: i
			});
		}


		win.global.dStore1App.list2Data = {
			identifier: "id",
			'items': []
		};
		for (i = 6; i < 11; i++) {
			win.global.dStore1App.list2Data.items.push({
				label: "Selection " + i,
				id: i
			});
		}

		has.add("requirejs", window.requirejs);
		/* jshint nonew: false */
		var jsonData = config;
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		//new Application(JSON.parse(jsonData));
		var appDeferred = new Application(JSON.parse(jsonData));
		appDeferred.then(function (app) {
			console.log("deferred resolved for new App [" + app.id + "] it should be started and default views shown");
		});
	});
