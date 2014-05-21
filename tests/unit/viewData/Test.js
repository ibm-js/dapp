// jshint unused:false, undef:false, quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/Application",
	"dapp/utils/view",
	"dojo/json",
	"dojo/topic",
	"dojo/on",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"delite/register",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/viewData/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, viewUtils, json, topic, on, domGeom, domClass, register, Deferred,
	viewDataconfig3) {
	// -------------------------------------------------------------------------------------- //
	// for viewDataSuite transition test
	var viewDataContainer3, viewDataNode3;
	var viewDataHtmlContent3 =
		"<d-view-stack id='viewDataAppdviewStack' style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";

	var viewDataSuite = {
		name: "viewDataSuite: test app transitions",
		setup: function () {
			appName = "viewDataApp"; // this is from the config
			viewDataContainer3 = document.createElement("div");
			document.body.appendChild(viewDataContainer3);
			viewDataContainer3.innerHTML = viewDataHtmlContent3;
			//	register.parse(viewDataContainer3);
			viewDataNode3 = document.getElementById("viewDataAppdviewStack");
			testApp = null;
			viewDataAppHome1View = null;
			viewDataAppHome2View = null;
			viewDataAppHome3NoControllerView = null;

		},
		"test initial view": function () {
			var d = this.async(10000);

			var appStartedDef3 = Application(json.parse(stripComments(viewDataconfig3)), viewDataContainer3);
			appStartedDef3.then(function (app) {
				// we are ready to test
				testApp = app;

				var viewDataAppHome1 = document.getElementById("viewDataAppHome1");

				// Here viewDataAppHome1View should be displayed

				viewDataAppHome1View = viewUtils.getViewFromViewId(testApp, "viewDataAppHome1");

				// check that init has been called on these views
				assert.isTrue(viewDataAppHome1View.initialized, "viewDataAppHome1View.initialized should be true");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(viewDataNode3, "root viewDataNode3 must be here");
				assert.isNotNull(viewDataAppHome1, "viewDataAppHome1 view must be here");
				assert.deepEqual(viewDataAppHome1View.beforeActivateCallCount, 1,
					"viewDataAppHome1View.beforeActivateCallCount should be 1");

				checkNodeVisibility(viewDataNode3, viewDataAppHome1);

				d.resolve();

			});
			return d;
		},

		// Currently showing viewDataAppHome1View test transition to viewDataAppHome3NoControllerView
		"viewDataNode3.show(viewDataAppHome3NoController)": function () {
			var d = this.async(10000);
			viewDataNode3.show("viewDataAppHome3NoController").then(function (complete) {
				var viewDataAppHome3NoController = document.getElementById("viewDataAppHome3NoController");
				checkNodeVisibility(viewDataNode3, viewDataAppHome3NoController);

				viewDataAppHome3NoControllerView = viewUtils.getViewFromViewId(testApp, "viewDataAppHome3NoController");

				// Now viewDataAppHome3NoController ActivateCallCounts should be 1
				checkActivateCallCount(viewDataAppHome3NoControllerView, 1);

				// Now viewDataAppHome1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(viewDataAppHome1View, 1);

				d.resolve();
			});

		},

		// Currently showing viewDataAppHome3NoController test transition back to viewDataAppHome1
		"testApp.showOrHideViews('viewDataAppHome1', params) tests data passed to view": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();

			displayDeferred.then(function (complete) {
				var viewDataAppHome1 = document.getElementById("viewDataAppHome1");
				checkNodeVisibility(viewDataNode3, viewDataAppHome1);

				// Now viewDataAppHome1View ActivateCallCounts should be 2
				checkActivateCallCount(viewDataAppHome1View, 2);

				// Now viewDataAppHome3NoControllerView DeactivateCallCounts should be 1
				checkDeactivateCallCount(viewDataAppHome3NoControllerView, 1);

				assert.equal(viewDataAppHome1View.viewData, "testData",
					"viewDataAppHome1View.viewData should equal testData");

				d.resolve();
			});
			//	viewDataNode3.show("viewDataAppHome1");
			var params = {
				viewData: "testData",
				displayDeferred: displayDeferred
			};
			testApp.showOrHideViews('viewDataAppHome1', params);

		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			viewDataContainer3.parentNode.removeChild(viewDataContainer3);
			testApp.unloadApp();
		}
	};

	registerSuite(viewDataSuite);

	function checkNodeVisibility(vs, target) {
		for (var i = 0; i < vs.children.length; i++) {
			assert.isTrue(
				((vs.children[i] === target && vs.children[i].style.display !== "none") ||
					(vs.children[i] !== target && vs.children[i].style.display === "none")),
				"checkNodeVisibility FAILED for target.id=" + (target ? target.id : "")
			);
		}
	}

	function checkActivateCallCount(view, count) {
		if (view) {
			assert.deepEqual(view.beforeActivateCallCount, count,
				view.id + " beforeActivateCallCount should be " + count);
			assert.deepEqual(view.afterActivateCallCount, count,
				view.id + " afterActivateCallCount should be " + count);

			//also test for selectedChildren being set correctly with constraint main
			var selectedChildId = testApp.selectedChildren.main.id;
			assert.deepEqual(view.id, selectedChildId, view.id + " should be in testApp.selectedChildren.main. ");

			//also test for view._active being set correctly to true
			assert.isTrue(view._active, "view_active should be true for " + view.id);
		}
	}

	function checkDeactivateCallCount(view, count) {
		if (view) {
			assert.deepEqual(view.beforeDeactivateCallCount, count,
				view.id + " beforeDeactivateCallCount should be " + count);
			assert.deepEqual(view.afterDeactivateCallCount, count,
				view.id + " afterDeactivateCallCount should be " + count);

			//also test for view._active being set correctly to false
			assert.isFalse(view._active, "view_active should be false for " + view.id);
		}
	}

	// strip out single line comments from the json config
	function stripComments(jsonData) {
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		return jsonData;
	}

});
