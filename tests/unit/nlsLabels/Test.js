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
	"requirejs-text/text!dapp/tests/unit/nlsLabels/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, viewUtils, json, topic, on, domGeom, domClass, register, Deferred,
	nlsLabelsconfig3) {
	// -------------------------------------------------------------------------------------- //
	// TODO: should add a nested nls test with strings at the parent view available to the child view.
	// for nlsLabelsSuite transition test
	var nlsLabelsContainer3, nlsLabelsNode3;
	var nlsLabelsHtmlContent3 =
		"<d-view-stack id='nlsLabelsAppdviewStack' style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";

	var nlsLabelsSuite = {
		name: "nlsLabelsSuite: test app transitions",
		setup: function () {
			appName = "nlsLabelsApp"; // this is from the config
			nlsLabelsContainer3 = document.createElement("div");
			document.body.appendChild(nlsLabelsContainer3);
			nlsLabelsContainer3.innerHTML = nlsLabelsHtmlContent3;
			//	register.parse(nlsLabelsContainer3);
			nlsLabelsNode3 = document.getElementById("nlsLabelsAppdviewStack");
			testApp = null;
			nlsLabelsAppHome1View = null;
			nlsLabelsAppHome2View = null;
			nlsLabelsAppHome3NoControllerView = null;

		},
		"test initial view and nls labels": function () {
			var d = this.async(10000);

			var appStartedDef3 = Application(json.parse(stripComments(nlsLabelsconfig3)), nlsLabelsContainer3);
			appStartedDef3.then(function (app) {
				// we are ready to test
				testApp = app;

				var nlsLabelsAppHome1 = document.getElementById("nlsLabelsAppHome1");

				// Here nlsLabelsAppHome1View should be displayed

				nlsLabelsAppHome1View = viewUtils.getViewFromViewId(testApp, "nlsLabelsAppHome1");

				// check that init has been called on these views
				assert.isTrue(nlsLabelsAppHome1View.initialized, "nlsLabelsAppHome1View.initialized should be true");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(nlsLabelsNode3, "root nlsLabelsNode3 must be here");
				assert.isNotNull(nlsLabelsAppHome1, "nlsLabelsAppHome1 view must be here");
				assert.deepEqual(nlsLabelsAppHome1View.beforeActivateCallCount, 1,
					"nlsLabelsAppHome1View.beforeActivateCallCount should be 1");

				checkNodeVisibility(nlsLabelsNode3, nlsLabelsAppHome1);

				//Test NLS Strings for app and view
				var testAppNlsLabelDom = document.getElementById("testAppNlsLabel");
				var testViewNlsLabelDom = document.getElementById("testViewNlsLabel");
				assert.deepEqual(testAppNlsLabelDom.innerHTML, "Label Zero", "testAppNlsLabel should be Label Zero");
				assert.deepEqual(testViewNlsLabelDom.innerHTML, "Label One", "testViewNlsLabelDom should be Label One");

				setTimeout(function () { // try timeout to wait for afterAcivate...
					d.resolve();
				}, 100);

			});
			return d;
		},

		// Currently showing nlsLabelsAppHome1View test transition to nlsLabelsAppHome3NoControllerView
		"nlsLabelsNode3.show(nlsLabelsAppHome3NoController)": function () {
			var d = this.async(10000);
			nlsLabelsNode3.show("nlsLabelsAppHome3NoController").then(function (complete) {
				var nlsLabelsAppHome3NoController = document.getElementById("nlsLabelsAppHome3NoController");
				checkNodeVisibility(nlsLabelsNode3, nlsLabelsAppHome3NoController);

				nlsLabelsAppHome3NoControllerView = viewUtils.getViewFromViewId(testApp,
					"nlsLabelsAppHome3NoController");

				// Now nlsLabelsAppHome3NoController ActivateCallCounts should be 1
				checkActivateCallCount(nlsLabelsAppHome3NoControllerView, 1);

				// Now nlsLabelsAppHome1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(nlsLabelsAppHome1View, 1);

				//Test NLS Strings for app and view
				var testAppNlsLabelDom = document.getElementById("testAppNlsLabel");
				var testViewNlsLabelDom = document.getElementById("testViewNlsLabel");
				assert.deepEqual(testAppNlsLabelDom.innerHTML, "Label Zero", "testAppNlsLabel should be Label Zero");
				assert.deepEqual(testViewNlsLabelDom.innerHTML, "Label One", "testViewNlsLabelDom should be Label One");

				d.resolve();
			});

		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			nlsLabelsContainer3.parentNode.removeChild(nlsLabelsContainer3);
			testApp.unloadApp();
		}
	};

	registerSuite(nlsLabelsSuite);

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
