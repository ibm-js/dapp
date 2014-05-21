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
	"requirejs-text/text!dapp/tests/unit/viewLayout/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, json, on, domGeom, domClass, register, Deferred,
	viewLayoutconfig) {
	// -------------------------------------------------------------------------------------- //
	// for viewLayoutSuite
	var viewLayoutContainer2, viewLayoutNode2;
	var viewLayoutHtmlContent2 =
		"<d-linear-layout id='viewLayoutAppdlayout' style='height:500px'>" +
		"</d-linear-layout>";

	var viewLayoutSuite = {
		name: "viewLayoutSuite dapp viewLayout: test app initial layout",
		setup: function () {
			appName = "viewLayoutApp"; // this is from the config
			viewLayoutContainer2 = document.createElement("div");
			document.body.appendChild(viewLayoutContainer2);
			viewLayoutContainer2.innerHTML = viewLayoutHtmlContent2;
			register.parse(viewLayoutContainer2);
			viewLayoutNode2 = document.getElementById("viewLayoutAppdlayout");
			testApp = null;

		},
		"viewLayoutSuite dapp viewLayout test domNode sizes": function () {
			var d = this.async(10000);

			// create the app from the config and wait for the deferred
			var appStartedDef = Application(json.parse(stripComments(viewLayoutconfig)), viewLayoutContainer2);
			appStartedDef.then(function (app) {
				// we are ready to test
				testApp = app;

				// check the DOM state to see if we are in the expected state
				assert.isNotNull(document.getElementById("viewLayoutAppdlayout"),
					"root viewLayoutAppdlayout must be here");
				assert.isNotNull(document.getElementById("viewLayoutAppHome1"), "viewLayoutAppHome1 view must be here");
				assert.isNotNull(document.getElementById("viewLayoutAppHome2"), "viewLayoutAppHome2 view must be here");
				assert.isNotNull(document.getElementById("viewLayoutAppHome3NoController"),
					"viewLayoutAppHome3NoController view must be here");

				var children = viewLayoutNode2.getChildren();
				viewLayoutNode2.style.height = "600px";
				children[1].style.height = "";
				//	domClass.add(children[1], "fill");
				var box1 = domGeom.getMarginBox(children[0]);
				var box2 = domGeom.getMarginBox(children[1]);
				var box3 = domGeom.getMarginBox(children[2]);
				assert.deepEqual(box1.h, 200);
				assert.deepEqual(box3.h, 200);
				assert.deepEqual(box1.h, box2.h);

				// test is finished resolved the deferred
				d.resolve();
			});
			return d;
		},
		// hide one view and verify sizes
		"viewLayoutSuite dapp viewLayout hide viiew and test domNode sizes": function () {
			var d = this.async(10000);

			var hideDeferred = document.getElementById("viewLayoutAppdlayout").hide("viewLayoutAppHome2");
			hideDeferred.then(function () {
				assert.isNotNull(document.getElementById("viewLayoutAppdlayout"),
					"root viewLayoutAppdlayout must be here");
				assert.isNotNull(document.getElementById("viewLayoutAppHome1"), "viewLayoutAppHome1 view must be here");
				assert.isNotNull(document.getElementById("viewLayoutAppHome3NoController"),
					"viewLayoutAppHome3NoController view must be here");

				var children = viewLayoutNode2.getChildren();
				viewLayoutNode2.style.height = "600px";
				children[1].style.height = "";
				//	domClass.add(children[1], "fill");
				var box1 = domGeom.getMarginBox(children[0]);
				var box2 = domGeom.getMarginBox(children[1]);
				//	var box3 = domGeom.getMarginBox(children[2]);
				assert.deepEqual(box1.h, 300);
				assert.deepEqual(box2.h, 300);
				assert.deepEqual(box1.h, box2.h);
				d.resolve();
			});

			return d;
		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			viewLayoutContainer2.parentNode.removeChild(viewLayoutContainer2);
			testApp.unloadApp();
		}
	};
	registerSuite(viewLayoutSuite);

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
