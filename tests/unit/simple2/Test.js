// jshint unused:false, undef:false, quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/main",
	"dojo/json",
	"dojo/topic",
	"dojo/on",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"delite/register",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/simple2/app1.json",
	"requirejs-text/text!dapp/tests/unit/simple2/app2.json",
	"requirejs-text/text!dapp/tests/unit/simple2/app3.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, main, json, topic, on, domGeom, domClass, register, Deferred,
	simple2config1, simple2config2, simple2config3) {
	// for sample2Suite1
	var sample2Container1, sample2Node1;
	var sample2HtmlContent1 =
		"<d-linear-layout id='simple2App1dlayout' style='height:500px'>" +
		"</d-linear-layout>";

	var sample2Suite1 = {
		name: "sample2Suite1 dapp simple2: test app status",
		setup: function () {
			sample2Container1 = document.createElement("div");
			document.body.appendChild(sample2Container1);
			sample2Container1.innerHTML = sample2HtmlContent1;
			register.parse(sample2Container1);
			sample2Node1 = document.getElementById("simple2App1dlayout");
			testApp = null;
			previousStatus = 0;
			appName = "simple2App";
		},
		"sample2Suite1 dapp simple2 test app status": function () {
			var d = this.async(20000);

			var handle;
			// check the app status as it updates when the app is started and stopped
			handle = topic.subscribe("/app/status", function (status, appId) {
				if (appId === appName) {
					assert.deepEqual(status, previousStatus + 1, "app status should progress from Starting to Stopped");
					previousStatus = status;
					if (previousStatus === 4) { // STOPPED
						handle.remove();
					}
				}
			});

			// create the app from the config and wait for the deferred
			var appStartedDef = main(json.parse(stripComments(simple2config1)), sample2Container1);
			appStartedDef.then(function (app) {
				// we are ready to test
				testApp = app;

				// check the app status it should be STARTED
				testApp.log("testApp:", 'simple2/Simple test testApp.getStatus()=' + testApp.getStatus());
				assert.deepEqual(testApp.getStatus(), testApp.lifecycle.STARTED);

				// This section would normally go in teardown, but do it here to test status
				sample2Container1.parentNode.removeChild(sample2Container1);

				var appStoppedDef = testApp.unloadApp(); // unload and stop the app
				appStoppedDef.then(function () { // when the app is unloaded verify status and call resolve
					testApp.log("testApp:", 'simple2/Simple test testApp.getStatus()=' + testApp.getStatus());
					assert.deepEqual(testApp.getStatus(), testApp.lifecycle.STOPPED);

					// test is finished resolved the deferred
					d.resolve();
				});
			});
			return d;
		},
		teardown: function () {
			testApp.unloadApp();
		}
	};
	registerSuite(sample2Suite1);

	// -------------------------------------------------------------------------------------- //
	// for sample2Suite2
	var sample2Container2, sample2Node2;
	var sample2HtmlContent2 =
		"<d-linear-layout id='simple2App2dlayout' style='height:500px'>" +
		"</d-linear-layout>";

	var sample2Suite2 = {
		name: "sample2Suite2 dapp Simple2: test app initial layout",
		setup: function () {
			appName = "simple2App2"; // this is from the config
			sample2Container2 = document.createElement("div");
			document.body.appendChild(sample2Container2);
			sample2Container2.innerHTML = sample2HtmlContent2;
			register.parse(sample2Container2);
			sample2Node2 = document.getElementById("simple2App2dlayout");
			testApp = null;

		},
		"sample2Suite2 dapp simple2 test domNode sizes": function () {
			var d = this.async(10000);

			// create the app from the config and wait for the deferred
			var appStartedDef = main(json.parse(stripComments(simple2config2)), sample2Container2);
			appStartedDef.then(function (app) {
				// we are ready to test
				testApp = app;

				// check the DOM state to see if we are in the expected state
				assert.isNotNull(document.getElementById("simple2App2dlayout"), "root simple2App2dlayout must be here");
				assert.isNotNull(document.getElementById("simple2App2Home1"), "simple2App2Home1 view must be here");
				assert.isNotNull(document.getElementById("simple2App2Home2"), "simple2App2Home2 view must be here");
				assert.isNotNull(document.getElementById("simple2App2Home3NoController"),
					"simple2App2Home3NoController view must be here");

				var children = sample2Node2.getChildren();
				sample2Node2.style.height = "600px";
				children[1].style.height = "";
				//	domClass.add(children[1], "fill");
				var box1 = domGeom.getMarginBox(children[0]);
				var box2 = domGeom.getMarginBox(children[1]);
				var box3 = domGeom.getMarginBox(children[2]);
				//testApp.log("testApp:",'simple2/Simple sample2Suite simple2App1Home1 height =['+box1.h+']');
				//testApp.log("testApp:",'simple2/Simple sample2Suite simple2App1Home2 height =['+box2.h+']');
				//testApp.log("testApp:",'simple2/Simple sample2Suite simple2App1Home3NoController h =['+box3.h+']');
				assert.deepEqual(box1.h, 200);
				assert.deepEqual(box3.h, 200);
				assert.deepEqual(box1.h, box2.h);

				// test is finished resolved the deferred
				d.resolve();
			});
			return d;
		},
		// hide one view and verify sizes
		"sample2Suite2 dapp simple2 hide viiew and test domNode sizes": function () {
			var d = this.async(10000);

			var hideDeferred = document.getElementById("simple2App2dlayout").hide("simple2App2Home2");
			hideDeferred.then(function () {
				assert.isNotNull(document.getElementById("simple2App2dlayout"), "root simple2App2dlayout must be here");
				assert.isNotNull(document.getElementById("simple2App2Home1"), "simple2App2Home1 view must be here");
				//assert.isNotNull(document.getElementById("simple2App2Home2"), "simple2App2Home2 view must be here");
				assert.isNotNull(document.getElementById("simple2App2Home3NoController"),
					"simple2App2Home3NoController view must be here");

				var children = sample2Node2.getChildren();
				sample2Node2.style.height = "600px";
				children[1].style.height = "";
				//	domClass.add(children[1], "fill");
				var box1 = domGeom.getMarginBox(children[0]);
				var box2 = domGeom.getMarginBox(children[1]);
				//	var box3 = domGeom.getMarginBox(children[2]);
				//testApp.log("testApp:",'simple2/Simple sample2Suite simple2App1Home1 height =['+box1.h+']');
				//testApp.log("testApp:",'simple2/Simple sample2Suite simple2App1Home2 height =['+box2.h+']');
				//testApp.log("testApp:",'simple2/Simple sample2Suite simple2App1Home3NoController h =['+box3.h+']');
				assert.deepEqual(box1.h, 300);
				assert.deepEqual(box2.h, 300);
				assert.deepEqual(box1.h, box2.h);
				d.resolve();
			});

			return d;
		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			sample2Container2.parentNode.removeChild(sample2Container2);
			testApp.unloadApp();
		}
	};
	registerSuite(sample2Suite2);


	// -------------------------------------------------------------------------------------- //
	// for sample2Suite3
	var sample2Container3, sample2Node3;
	var sample2HtmlContent3 =
		"<d-view-stack id='simple2App3dviewStack' style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";

	var sample2Suite3 = {
		name: "sample2Suite3 dapp Simple3: test app transitions",
		setup: function () {
			appName = "simple2App3"; // this is from the config
			sample2Container3 = document.createElement("div");
			document.body.appendChild(sample2Container3);
			sample2Container3.innerHTML = sample2HtmlContent3;
			register.parse(sample2Container3);
			sample2Node3 = document.getElementById("simple2App3dviewStack");
			testApp = null;

		},
		"sample2Suite3 dapp simple3 test initial layout": function () {
			var d = this.async(10000);

			var appStartedDef = main(json.parse(stripComments(simple2config3)), sample2Container3);
			appStartedDef.then(function (app) {
				// we are ready to test
				testApp = app;

				var simple2App3Home1 = document.getElementById("simple2App3Home1");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(sample2Node3, "root sample2Node3 must be here");
				assert.isNotNull(simple2App3Home1, "simple2App3Home1 view must be here");

				checkNodeVisibility(sample2Node3, simple2App3Home1);

				// test is finished resolved the deferred
				d.resolve();
			});
			return d;
		},

		// NOTE: these tests will show transition the views, but call to before/afterDeactivate are not working here
		// because the next transition fires before the call to afterActivate.
		"Show (by widget.show with id) test on delite-after-show": function () {
			var d = this.async(10000);

			on.once(sample2Node3, "delite-after-show", function (complete) {
				var simple2App3Home3NoController = document.getElementById("simple2App3Home3NoController");
				checkNodeVisibility(sample2Node3, simple2App3Home3NoController);
				d.resolve();
			});
			sample2Node3.show("simple2App3Home3NoController");
		},
		"Show (by widget.show with id) test with deferred": function () {
			var d = this.async(10000);

			var showDeferred = sample2Node3.show("simple2App3Home1");
			showDeferred.then(function () {
				var simple2App3Home1 = document.getElementById("simple2App3Home1");
				checkNodeVisibility(sample2Node3, simple2App3Home1);
				d.resolve();
			});
		},
		"Show (by widget.show with id) test with sample2Node3.on(delite-after-show)": function () {
			var d = this.async(10000);

			var handle = sample2Node3.on("delite-after-show", d.callback(function () {
				var simple2App3Home3NoController = document.getElementById("simple2App3Home3NoController");
				checkNodeVisibility(sample2Node3, simple2App3Home3NoController);
				handle.remove(); // avoid second calls from other tests
			}));

			var showDeferred = sample2Node3.show("simple2App3Home3NoController");
		},
		"Test displayView (by view name) ": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();

			testApp.displayView('simple2App3Home2', {
				displayDeferred: displayDeferred
			});
			displayDeferred.then(function () {
				var simple2App3Home2 = document.getElementById("simple2App3Home2");
				checkNodeVisibility(sample2Node3, simple2App3Home2);
				d.resolve();
			});
		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			sample2Container3.parentNode.removeChild(sample2Container3);
			testApp.unloadApp();
		}
	};

	registerSuite(sample2Suite3);

	function checkNodeVisibility(vs, target) {
		for (var i = 0; i < vs.children.length; i++) {
			assert.isTrue(
				((vs.children[i] === target && vs.children[i].style.display !== "none") ||
					(vs.children[i] !== target && vs.children[i].style.display === "none")),
				"checkNodeVisibility FAILED for target.id=" + (target ? target.id : "")
			);
		}
	}

	// strip out single line comments from the json config
	function stripComments(jsonData) {
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		return jsonData;
	}

});
