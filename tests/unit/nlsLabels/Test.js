// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"decor/sniff",
	"dapp/Application",
	"dapp/utils/view",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/nlsLabels/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, has, Application, viewUtils, Deferred,
	nlsLabelsconfig3) {
	if (has("ie") === 10) {
		console.log("Skipping nlsLabelsSuite tests on IE10");
		return;
	}
	// -------------------------------------------------------------------------------------- //
	// TODO: should add a nested nls test with strings at the parent view available to the child view.
	// for nlsLabelsSuite transition test
	var nlsLabelsContainer3,
		testApp,
		nlsLabelsAppHome1View,
		nlsLabelsAppHome3NoControllerView,

		nlsLabelsNode3;
	var nlsLabelsHtmlContent3 =
		"<d-view-stack id='nlsLabelsAppdviewStack' style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";

	var nlsLabelsSuite = {
		name: "nlsLabelsSuite: test app transitions",
		setup: function () {
			nlsLabelsContainer3 = document.createElement("div");
			document.body.appendChild(nlsLabelsContainer3);
			nlsLabelsContainer3.innerHTML = nlsLabelsHtmlContent3;
			nlsLabelsNode3 = document.getElementById("nlsLabelsAppdviewStack");
		},
		"test initial view and nls labels": function () {
			this.timeout = 20000;

			var appStartedDef3 = new Application(JSON.parse(stripComments(nlsLabelsconfig3)), nlsLabelsContainer3);
			return appStartedDef3.then(function (app) {
				// we are ready to test
				testApp = app;

				var nlsLabelsAppHome1 = document.getElementById("nlsLabelsAppHome1");

				// Here nlsLabelsAppHome1View should be displayed
				nlsLabelsAppHome1View = viewUtils.getViewFromViewId(testApp, "nlsLabelsAppHome1");

				nlsLabelsAppHome1View.deliver(); // to get handlebars to update now

				// check that init has been called on these views
				assert.isTrue(nlsLabelsAppHome1View.initialized, "nlsLabelsAppHome1View.initialized should be true");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(nlsLabelsNode3, "root nlsLabelsNode3 must be here");
				assert.isNotNull(nlsLabelsAppHome1, "nlsLabelsAppHome1 view must be here");
				assert.strictEqual(nlsLabelsAppHome1View._beforeActivateCallCount, 1,
					"nlsLabelsAppHome1View._beforeActivateCallCount should be 1");
				assert.isTrue(testApp.hasTestPassed, "testApp.hasTestPassed should be true");

				checkNodeVisibility(nlsLabelsNode3, nlsLabelsAppHome1);

				//Test NLS Strings for app and view
				var testAppNlsLabelDom = document.getElementById("testAppNlsLabel");
				var testViewNlsLabelDom = document.getElementById("testViewNlsLabel");
				assert.strictEqual(testAppNlsLabelDom.innerHTML, "Label Zero", "testAppNlsLabel should be Label Zero");
				assert.strictEqual(testViewNlsLabelDom.innerHTML, "Label One",
					"testViewNlsLabelDom should be Label One");
			});
		},

		// Currently showing nlsLabelsAppHome1View test transition to nlsLabelsAppHome3NoControllerView
		"nlsLabelsNode3.show(nlsLabelsAppHome3NoController)": function () {
			this.timeout = 20000;
			return nlsLabelsNode3.show("nlsLabelsAppHome3NoController").then(function () {
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
				assert.strictEqual(testAppNlsLabelDom.innerHTML, "Label Zero", "testAppNlsLabel should be Label Zero");
				assert.strictEqual(testViewNlsLabelDom.innerHTML, "Label One",
					"testViewNlsLabelDom should be Label One");
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
			if (vs.children[i] === target) {
				assert.strictEqual(vs.children[i].style.display, "",
					"checkNodeVisibility FAILED for target.id=" + target.id + " display should equal blank");
			} else {
				assert.strictEqual(vs.children[i].style.display, "none",
					"checkNodeVisibility FAILED other children style.display should equal none");
			}
		}
	}

	function checkActivateCallCount(view, count) {
		if (view) {
			assert.strictEqual(view._beforeActivateCallCount, count,
				view.id + " _beforeActivateCallCount should be " + count);
			assert.strictEqual(view._afterActivateCallCount, count,
				view.id + " _afterActivateCallCount should be " + count);

			//also test for selectedChildren being set correctly with constraint view.parentNode.id
			var selectedChildId = testApp.selectedChildren[view.parentNode.id].id;
			assert.strictEqual(view.id, selectedChildId, view.id +
				" should be in testApp.selectedChildren[view.parentNode.id]. ");

			//also test for view._active being set correctly to true
			assert.isTrue(view._active, "view_active should be true for " + view.id);
		}
	}

	function checkDeactivateCallCount(view, count) {
		if (view) {
			assert.strictEqual(view._beforeDeactivateCallCount, count,
				view.id + " _beforeDeactivateCallCount should be " + count);
			assert.strictEqual(view._afterDeactivateCallCount, count,
				view.id + " _afterDeactivateCallCount should be " + count);

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
