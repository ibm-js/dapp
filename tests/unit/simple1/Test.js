// jshint unused:false, undef:false, quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/main",
	"dapp/utils/viewUtils",
	"dojo/json",
	"dojo/topic",
	"dojo/on",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"delite/register",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/simple1/app3.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, main, viewUtils, json, topic, on, domGeom, domClass, register, Deferred,
	simple1config3) {
	// -------------------------------------------------------------------------------------- //
	// for simple1Suite3 transition test
	var simple1Container3, simple1Node3;
	var simple1HtmlContent3 =
		"<d-view-stack id='simple1App3dviewStack' style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";

	var simple1Suite3 = {
		name: "simple1Suite3: test app transitions",
		setup: function () {
			appName = "simple1App3"; // this is from the config
			simple1Container3 = document.createElement("div");
			document.body.appendChild(simple1Container3);
			simple1Container3.innerHTML = simple1HtmlContent3;
			//	register.parse(simple1Container3);
			simple1Node3 = document.getElementById("simple1App3dviewStack");
			testApp = null;
			simple1App3Home1View = null;
			simple1App3Home2View = null;
			simple1App3Home3NoControllerView = null;

		},
		"test initial view and nls labels": function () {
			var d = this.async(10000);

			var appStartedDef3 = main(json.parse(stripComments(simple1config3)), simple1Container3);
			appStartedDef3.then(function (app) {
				// we are ready to test
				testApp = app;

				var simple1App3Home1 = document.getElementById("simple1App3Home1");

				// Here simple1App3Home1View should be displayed

				simple1App3Home1View = viewUtils.getViewFromViewId(testApp, "simple1App3Home1");

				// check that init has been called on these views
				assert.isTrue(simple1App3Home1View.initialized, "simple1App3Home1View.initialized should be true");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(simple1Node3, "root simple1Node3 must be here");
				assert.isNotNull(simple1App3Home1, "simple1App3Home1 view must be here");
				assert.deepEqual(simple1App3Home1View.beforeActivateCallCount, 1,
					"simple1App3Home1View.beforeActivateCallCount should be 1");

				checkNodeVisibility(simple1Node3, simple1App3Home1);

				//Test NLS Strings for app and view
				var testAppNlsLabelDom = document.getElementById("testAppNlsLabel");
				var testViewNlsLabelDom = document.getElementById("testViewNlsLabel");
				assert.deepEqual(testAppNlsLabelDom.innerText, "Label Zero", "testAppNlsLabel should be Label Zero");
				assert.deepEqual(testViewNlsLabelDom.innerText, "Label One", "testViewNlsLabelDom should be Label One");

				setTimeout(function () { // try timeout to wait for afterAcivate...
					d.resolve();
				}, 100);

			});
			return d;
		},

		// Currently showing simple1App3Home1View test transition to simple1App3Home3NoControllerView
		"simple1Node3.show(simple1App3Home3NoController)": function () {
			var d = this.async(10000);
			simple1Node3.show("simple1App3Home3NoController").then(function (complete) {
				var simple1App3Home3NoController = document.getElementById("simple1App3Home3NoController");
				checkNodeVisibility(simple1Node3, simple1App3Home3NoController);

				simple1App3Home3NoControllerView = viewUtils.getViewFromViewId(testApp, "simple1App3Home3NoController");

				// Now simple1App3Home3NoController ActivateCallCounts should be 1
				checkActivateCallCount(simple1App3Home3NoControllerView, 1);

				// Now simple1App3Home1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(simple1App3Home1View, 1);

				//Test NLS Strings for app and view
				var testAppNlsLabelDom = document.getElementById("testAppNlsLabel");
				var testViewNlsLabelDom = document.getElementById("testViewNlsLabel");
				assert.deepEqual(testAppNlsLabelDom.innerText, "Label Zero", "testAppNlsLabel should be Label Zero");
				assert.deepEqual(testViewNlsLabelDom.innerText, "Label One", "testViewNlsLabelDom should be Label One");

				d.resolve();
			});

		},

		// Currently showing simple1App3Home3NoController test transition back to simple1App3Home1
		"testApp.showOrHideView('simple1App3Home1', params) tests data passed to view": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();

			displayDeferred.then(function (complete) {
				var simple1App3Home1 = document.getElementById("simple1App3Home1");
				checkNodeVisibility(simple1Node3, simple1App3Home1);

				// Now simple1App3Home1View ActivateCallCounts should be 2
				checkActivateCallCount(simple1App3Home1View, 2);

				// Now simple1App3Home3NoControllerView DeactivateCallCounts should be 1
				checkDeactivateCallCount(simple1App3Home3NoControllerView, 1);

				assert.equal(simple1App3Home1View.viewData, "testData",
					"simple1App3Home1View.viewData should equal testData");

				d.resolve();
			});
			//	simple1Node3.show("simple1App3Home1");
			var params = {
				viewData: "testData",
				displayDeferred: displayDeferred
			};
			testApp.showOrHideView('simple1App3Home1', params);

		},

		// Currently showing simple1App3Home1 test transition back to simple1App3Home2
		"testApp.showOrHideView('simple1App3Home2')": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();

			displayDeferred.then(function (complete) {
				var simple1App3Home2 = document.getElementById("simple1App3Home2");
				simple1App3Home2View = viewUtils.getViewFromViewId(testApp, "simple1App3Home2");
				checkNodeVisibility(simple1Node3, simple1App3Home2);

				// Now simple1App3Home2View ActivateCallCounts should be 1
				checkActivateCallCount(simple1App3Home2View, 1);

				// Now simple1App3Home3NoControllerView DeactivateCallCounts should be 2
				checkDeactivateCallCount(simple1App3Home3NoControllerView, 1);
				// Now simple1App3Home1View DeactivateCallCounts should be 2
				checkDeactivateCallCount(simple1App3Home1View, 2);

				d.resolve();
			});
			testApp.showOrHideView('simple1App3Home2', {
				displayDeferred: displayDeferred
			});
		},
		// Currently showing simple1App3Home2 test hide simple1App3Home2
		"testApp.showOrHideView('-simple1App3Home2') Hide View": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();

			displayDeferred.then(function (complete) {
				var simple1App3Home2 = document.getElementById("simple1App3Home2");
				simple1App3Home2View = viewUtils.getViewFromViewId(testApp, "simple1App3Home2");
				assert.isNull(simple1App3Home2);
				assert.isNull(simple1App3Home2View.domNode.parentNode);

				// Now simple1App3Home2View ActivateCallCounts should be 1
				var view = simple1App3Home2View;
				var count = 1;
				assert.deepEqual(view.beforeActivateCallCount, count,
					view.id + " beforeActivateCallCount should be " + count);
				assert.deepEqual(view.afterActivateCallCount, count,
					view.id + " afterActivateCallCount should be " + count);

				// Now simple1App3Home3NoControllerView DeactivateCallCounts should be 2
				checkDeactivateCallCount(simple1App3Home2View, 1);

				d.resolve();
			});
			testApp.showOrHideView('-simple1App3Home2', {
				displayDeferred: displayDeferred
			});
		},
		// Currently showing nothing test transition to simple1App3Home3NoController
		"simple1Node3.show('simple1App3Home3NoController')": function () {
			var d = this.async(10000);

			simple1Node3.show('simple1App3Home3NoController').then(function (complete) {
				var simple1App3Home3NoController = document.getElementById("simple1App3Home3NoController");
				checkNodeVisibility(simple1Node3, simple1App3Home3NoController);

				// Now simple1App3Home3NoControllerView ActivateCallCounts should be 2
				checkActivateCallCount(simple1App3Home3NoControllerView, 2);

				// Now simple1App3Home1View DeactivateCallCounts should be 2
				checkDeactivateCallCount(simple1App3Home1View, 2);

				d.resolve();
			});

		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			simple1Container3.parentNode.removeChild(simple1Container3);
			testApp.unloadApp();
		}
	};

	registerSuite(simple1Suite3);

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
