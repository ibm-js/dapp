// jshint unused:false, undef:false, quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/Application",
	"dojo/json",
	"dojo/on",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"delite/register",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/appStatus/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, json, on, domGeom, domClass, register, Deferred,
	appStatusConfig) {
	// for appStatusSuite
	var appStatusContainer1, appStatusNode1;
	var appStatusHtmlContent1 =
		"<d-linear-layout id='appStatusApp1dlayout' style='height:500px'>" +
		"</d-linear-layout>";

	var appStatusSuite = {
		name: "appStatusSuite dapp appStatus: test app status",
		setup: function () {
			appStatusContainer1 = document.createElement("div");
			document.body.appendChild(appStatusContainer1);
			appStatusContainer1.innerHTML = appStatusHtmlContent1;
			register.parse(appStatusContainer1);
			appStatusNode1 = document.getElementById("appStatusApp1dlayout");
			testApp = null;
			previousStatus = 0;
			appName = "appStatusApp1";
		},
		"appStatusSuite dapp appStatus test app status": function () {
			var d = this.async(20000);

			var handle;
			// check the app status as it updates when the app is started and stopped
			handle = on(document, "dapp-status-change", function (params) {
				var appId = params.app.id;
				var status = params.status;
				if (appId === appName) {
					assert.deepEqual(status, previousStatus + 1, "app status should progress from Starting to Stopped");
					previousStatus = status;
					if (previousStatus === 4) { // STOPPED
						handle.remove();
					}
				}
			});

			// create the app from the config and wait for the deferred
			var appStartedDef = new Application(json.parse(stripComments(appStatusConfig)), appStatusContainer1);
			appStartedDef.then(function (appStatusTest) {
				// we are ready to test
				testApp = appStatusTest;

				// check the app status it should be STARTED
				assert.deepEqual(testApp.status, testApp.lifecycle.STARTED);

				// This section would normally go in teardown, but do it here to test status
				appStatusContainer1.parentNode.removeChild(appStatusContainer1);

				var appStoppedDef = testApp.unloadApp(); // unload and stop the app
				appStoppedDef.then(function () { // when the app is unloaded verify status and call resolve
					assert.deepEqual(testApp.status, testApp.lifecycle.STOPPED);

					// test is finished resolved the deferred
					d.resolve();
				});
			});
			return d;
		},
		teardown: function () {}
	};

	registerSuite(appStatusSuite);

	// strip out single line comments from the json config
	function stripComments(jsonData) {
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		return jsonData;
	}

});
