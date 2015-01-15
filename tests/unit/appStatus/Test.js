// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dojo/when",
	"dapp/Application",
	"delite/register",
	"requirejs-text/text!dapp/tests/unit/appStatus/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, when, Application, register, appStatusConfig) {
	// for appStatusSuite
	var appStatusContainer1,
		testApp,
		previousStatus,
		appName,
		appStatusNode1;

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
			previousStatus = 1;
			appName = "appStatusApp1";
		},
		"appStatusSuite dapp appStatus test app status": function () {
			this.timeout = 20000;

			// create the app from the config and wait for the promise
			return when(new Application(JSON.parse(stripComments(appStatusConfig)),
				appStatusContainer1).then(function (appStatusTest) {
				// we are ready to test
				testApp = appStatusTest;
				var handle = testApp.on("dapp-status-change", function (params) {
					var status = params.status;
					//console.log("in dapp-status-change with status = " + status);
					assert.strictEqual(status, previousStatus + 1,
						"app status should progress from Starting to Stopped");
					previousStatus = status;
					if (status === testApp.STOPPED) { // STOPPED
						handle.unadvise();
					}
				});

				// check the app status it should be STARTED
				assert.strictEqual(testApp.status, testApp.STARTED, "testApp.status should equal testApp.STARTED");
				// This section would normally go in teardown, but do it here to test status
				appStatusContainer1.parentNode.removeChild(appStatusContainer1);

			}));
		},
		teardown: function () {
			testApp.unloadApp().then(function () { // when the app is unloaded verify status and call resolve
				assert.strictEqual(testApp.status, testApp.STOPPED, "testApp.status should equal testApp.STOPPED");
			});
		}
	};

	registerSuite(appStatusSuite);

	// strip out single line comments from the json config
	function stripComments(jsonData) {
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		return jsonData;
	}

});
