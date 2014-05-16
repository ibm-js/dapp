// jshint unused:false, undef:false, quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/main",
	"dapp/utils/view",
	"dojo/json",
	"dojo/topic",
	"dojo/on",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"delite/register",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/hideView/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, main, viewUtils, json, topic, on, domGeom, domClass, register, Deferred,
	hideViewconfig) {
	// -------------------------------------------------------------------------------------- //
	// for hideViewSuite transition test
	var hideViewContainer, hideViewNode;
	var hideViewHtmlContent3 =
		"<d-view-stack id='hideViewApp3dviewStack' style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";

	var hideViewSuite = {
		name: "hideViewSuite: test app transitions",
		setup: function () {
			appName = "hideViewApp3"; // this is from the config
			hideViewContainer = document.createElement("div");
			document.body.appendChild(hideViewContainer);
			hideViewContainer.innerHTML = hideViewHtmlContent3;
			//	register.parse(hideViewContainer);
			hideViewNode = document.getElementById("hideViewApp3dviewStack");
			testApp = null;
			hideViewApp3Home1View = null;
			hideViewApp3Home2View = null;
			hideViewApp3Home3NoControllerView = null;

		},
		"test initial view": function () {
			var d = this.async(10000);

			var appStartedDef3 = main(json.parse(stripComments(hideViewconfig)), hideViewContainer);
			appStartedDef3.then(function (app) {
				// we are ready to test
				testApp = app;

				var hideViewApp3Home1 = document.getElementById("hideViewApp3Home1");

				// Here hideViewApp3Home1View should be displayed

				hideViewApp3Home1View = viewUtils.getViewFromViewId(testApp, "hideViewApp3Home1");

				// check that init has been called on these views
				assert.isTrue(hideViewApp3Home1View.initialized, "hideViewApp3Home1View.initialized should be true");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(hideViewNode, "root hideViewNode must be here");
				assert.isNotNull(hideViewApp3Home1, "hideViewApp3Home1 view must be here");
				assert.deepEqual(hideViewApp3Home1View.beforeActivateCallCount, 1,
					"hideViewApp3Home1View.beforeActivateCallCount should be 1");

				checkNodeVisibility(hideViewNode, hideViewApp3Home1);

				d.resolve();
			});
			return d;
		},

		// Currently showing hideViewApp3Home1View test transition to hide it
		"hideViewNode.hide(hideViewApp3Home1)": function () {
			var d = this.async(10000);
			hideViewNode.hide("hideViewApp3Home1").then(function (complete) {
				var hideViewApp3Home1 = document.getElementById("hideViewApp3Home1");
				hideViewApp3Home1View = viewUtils.getViewFromViewId(testApp, "hideViewApp3Home1");
				assert.isNull(hideViewApp3Home1);
				assert.isNull(hideViewApp3Home1View.domNode.parentNode);
				d.resolve();
			});

		},
		// Currently showing hideViewApp3Home1 test transition back to hideViewApp3Home2
		"testApp.showOrHideViews('hideViewApp3Home2')": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();

			displayDeferred.then(function (complete) {
				var hideViewApp3Home2 = document.getElementById("hideViewApp3Home2");
				hideViewApp3Home2View = viewUtils.getViewFromViewId(testApp, "hideViewApp3Home2");
				checkNodeVisibility(hideViewNode, hideViewApp3Home2);

				// Now hideViewApp3Home2View ActivateCallCounts should be 1
				checkActivateCallCount(hideViewApp3Home2View, 1);

				// Now hideViewApp3Home3NoControllerView DeactivateCallCounts should be 2
				checkDeactivateCallCount(hideViewApp3Home3NoControllerView, 1);
				// Now hideViewApp3Home1View DeactivateCallCounts should be 2
				checkDeactivateCallCount(hideViewApp3Home1View, 1);

				d.resolve();
			});
			testApp.showOrHideViews('hideViewApp3Home2', {
				displayDeferred: displayDeferred
			});
		},

		// Currently showing hideViewApp3Home2 test hide hideViewApp3Home2
		"testApp.showOrHideViews('-hideViewApp3Home2') Hide View": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();

			displayDeferred.then(function (complete) {
				var hideViewApp3Home2 = document.getElementById("hideViewApp3Home2");
				hideViewApp3Home2View = viewUtils.getViewFromViewId(testApp, "hideViewApp3Home2");
				assert.isNull(hideViewApp3Home2);
				assert.isNull(hideViewApp3Home2View.domNode.parentNode);

				// Now hideViewApp3Home2View ActivateCallCounts should be 1
				var view = hideViewApp3Home2View;
				var count = 1;
				assert.deepEqual(view.beforeActivateCallCount, count,
					view.id + " beforeActivateCallCount should be " + count);
				assert.deepEqual(view.afterActivateCallCount, count,
					view.id + " afterActivateCallCount should be " + count);

				// Now hideViewApp3Home3NoControllerView DeactivateCallCounts should be 2
				checkDeactivateCallCount(hideViewApp3Home2View, 1);

				d.resolve();
			});
			testApp.showOrHideViews('-hideViewApp3Home2', {
				displayDeferred: displayDeferred
			});
		},
		// Currently showing nothing test transition to hideViewApp3Home3NoController
		"hideViewNode.show('hideViewApp3Home3NoController')": function () {
			var d = this.async(10000);

			hideViewNode.show('hideViewApp3Home3NoController').then(function (complete) {
				var hideViewApp3Home3NoController = document.getElementById("hideViewApp3Home3NoController");
				checkNodeVisibility(hideViewNode, hideViewApp3Home3NoController);

				// Now hideViewApp3Home3NoControllerView ActivateCallCounts should be 2
				checkActivateCallCount(hideViewApp3Home3NoControllerView, 2);

				// Now hideViewApp3Home1View DeactivateCallCounts should be 2
				checkDeactivateCallCount(hideViewApp3Home1View, 1);

				d.resolve();
			});

		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			hideViewContainer.parentNode.removeChild(hideViewContainer);
			testApp.unloadApp();
		}
	};

	registerSuite(hideViewSuite);

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
