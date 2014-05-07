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
	"requirejs-text/text!dapp/tests/unit/nested1/app1.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, main, viewUtils, json, topic, on, domGeom, domClass, register, Deferred,
	nested1config1) {
	// -------------------------------------------------------------------------------------- //
	// for nested1Suite1 transition test
	var nested1Container1, nested1Node1;
	var nested1HtmlContent1 =
		"<d-view-stack id='nested1App1dviewStack' style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";

	var nested1Suite1 = {
		name: "nested1Suite1: test app transitions",
		setup: function () {
			appName = "nested1App1"; // this is from the config
			nested1Container1 = document.createElement("div");
			document.body.appendChild(nested1Container1);
			nested1Container1.innerHTML = nested1HtmlContent1;
			//	register.parse(nested1Container1); // no need to call parse here since config has "parseOnLoad": true
			nested1Node1 = document.getElementById("nested1App1dviewStack");
			testApp = null;
			nested1App1P1View = null;
			nested1App1S1View = null;
			nested1App1V1View = null;
			nested1App1V7View = null;

		},
		"test initial view": function () {
			var d = this.async(10000);

			var appStartedDef1 = main(json.parse(stripComments(nested1config1)), nested1Container1);
			appStartedDef1.then(function (app) {
				// we are ready to test
				testApp = app;

				var nested1App1P1 = document.getElementById("P1");

				// Here nested1App1Home1View should be displayed

				nested1App1P1View = viewUtils.getViewFromViewId(testApp, "P1");
				nested1App1S1View = viewUtils.getViewFromViewId(testApp, "P1_S1");
				nested1App1V1View = viewUtils.getViewFromViewId(testApp, "P1_S1_V1");

				// check that init has been called on these views
				assert.isTrue(nested1App1P1View.initialized, "nested1App1P1View.initialized should be true");
				assert.isTrue(nested1App1S1View.initialized, "nested1App1S1View.initialized should be true");
				assert.isTrue(nested1App1V1View.initialized, "nested1App1V1View.initialized should be true");

				// check the DOM state to see if we are in the expected state
				assert.isNotNull(nested1Node1, "root nested1Node1 must be here");
				assert.isNotNull(nested1App1P1, "nested1App1Home1 view must be here");
				//	assert.deepEqual(nested1App1P1View.beforeActivateCallCount, 1,
				//		"nested1App1P1View.beforeActivateCallCount should be 1");

				checkNodeVisibility(nested1Node1, nested1App1P1);
				setTimeout(function () { // try timeout to wait for afterAcivate...
					d.resolve();
				}, 300);
			});
			return d;
		},

		// Currently showing P1_S1_V1 test transition to V7
		"nested1Node1.show(V7)": function () {
			var d = this.async(10000);
			nested1Node1.show("V7").then(function (complete) {
				var nested1App1V7 = document.getElementById("V7");
				checkNodeVisibility(nested1Node1, nested1App1V7);

				nested1App1V7View = viewUtils.getViewFromViewId(testApp, "V7");
				nested1App1S1View = viewUtils.getViewFromViewId(testApp, "P1_S1");
				nested1App1V1View = viewUtils.getViewFromViewId(testApp, "P1_S1_V1");

				// Now nested1App1V2View ActivateCallCounts should be 1
				checkActivateCallCount(nested1App1V7View, 1);

				// Now nested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(nested1App1V1View, 1);
				checkDeactivateCallCount(nested1App1S1View, 1);
				checkDeactivateCallCount(nested1App1P1View, 1);

				d.resolve();
			});
		},

		// Currently showing V7 test transition to P1_S1_V1
		"nested1Node1.show(P1) will show P1,S1,V1": function () {
			var d = this.async(10000);
			nested1Node1.show("P1").then(function (complete) {
				var nested1App1V1 = document.getElementById("P1_S1_V1");
				checkNestedNodeVisibility(nested1Node1, nested1App1V1);

				// Now nested1App1V1View ActivateCallCounts should be 1
				checkActivateCallCount(nested1App1S1View, 2);
				checkActivateCallCount(nested1App1V1View, 2);
				checkActivateCallCount(nested1App1P1View, 2);

				// Now nested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(nested1App1V7View, 1);

				d.resolve();
			});
		},

		// Currently showing P1,S1,V1 test transition to P1_S1_V2
		"nested1App1S1View.containerNode.show('V2') will show P1,S1,V2": function () {
			var d = this.async(10000);
			nested1App1S1View.containerNode.show('V2').then(function (complete) {
				var nested1App1V2 = document.getElementById("P1_S1_V2");
				checkNestedNodeVisibility(nested1Node1, nested1App1V2);

				nested1App1V2View = viewUtils.getViewFromViewId(testApp, "P1_S1_V2");

				// Now nested1App1V1View ActivateCallCounts should be 1
				checkActivateCallCount(nested1App1V2View, 1);
				checkActivateCallCount(nested1App1V1View, 2, true);
				checkActivateCallCount(nested1App1S1View, 3);
				checkActivateCallCount(nested1App1P1View, 3);

				// Now nested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(nested1App1V7View, 1);
				checkDeactivateCallCount(nested1App1V1View, 2);
				checkDeactivateCallCount(nested1App1S1View, 2, true);
				checkDeactivateCallCount(nested1App1P1View, 2, true);

				d.resolve();
			});
		},

		// Currently showing P1_S1_V2 test transition to V7
		"testApp.showOrHideView('V7')": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var nested1App1V7 = document.getElementById("V7");
				checkNodeVisibility(nested1Node1, nested1App1V7);

				// Now nested1App1V2View ActivateCallCounts should be 1
				checkActivateCallCount(nested1App1V7View, 2);

				// Now nested1App1V1View ActivateCallCounts should be 1
				checkActivateCallCount(nested1App1V2View, 1, true);
				checkActivateCallCount(nested1App1V1View, 2, true);
				checkActivateCallCount(nested1App1S1View, 3, true);
				checkActivateCallCount(nested1App1P1View, 3, true);

				// Now nested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(nested1App1V7View, 1, true);
				checkDeactivateCallCount(nested1App1V1View, 2);
				checkDeactivateCallCount(nested1App1V2View, 1);
				checkDeactivateCallCount(nested1App1S1View, 3);
				checkDeactivateCallCount(nested1App1P1View, 3);

				d.resolve();
			});
			testApp.showOrHideView('V7', {
				displayDeferred: displayDeferred
			});
		},

		// Currently showing V7 test transition to P1_S1_V1
		"testApp.showOrHideView('P1') will show P1,S1,V1": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var nested1App1V1 = document.getElementById("P1_S1_V1");
				checkNestedNodeVisibility(nested1Node1, nested1App1V1);

				// Now nested1App1V2View ActivateCallCounts as follows
				checkActivateCallCount(nested1App1V7View, 2, true);
				checkActivateCallCount(nested1App1V2View, 1, true);
				checkActivateCallCount(nested1App1V1View, 3);
				checkActivateCallCount(nested1App1S1View, 4);
				checkActivateCallCount(nested1App1P1View, 4);

				// Now nested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(nested1App1V7View, 2);
				checkDeactivateCallCount(nested1App1V1View, 2, true);
				checkDeactivateCallCount(nested1App1V2View, 1, true);
				checkDeactivateCallCount(nested1App1S1View, 3, true);
				checkDeactivateCallCount(nested1App1P1View, 3, true);

				d.resolve();
			});
			testApp.showOrHideView('P1', {
				displayDeferred: displayDeferred
			});
		},

		teardown: function () {
			// call unloadApp to cleanup and end the test
			nested1Container1.parentNode.removeChild(nested1Container1);
			testApp.unloadApp();
		}
	};

	registerSuite(nested1Suite1);

	function checkNodeVisibility(vs, target) {
		for (var i = 0; i < vs.children.length; i++) {
			assert.isTrue(
				((vs.children[i] === target && vs.children[i].style.display !== "none") ||
					(vs.children[i] !== target && vs.children[i].style.display === "none")),
				"checkNodeVisibility FAILED for target.id=" + (target ? target.id : "")
			);
		}
	}

	function checkNestedNodeVisibility(vs, target) {
		for (var i = 0; i < vs.children.length; i++) {
			assert.isTrue(
				(target.style.display !== "none"),
				"checkNestedNodeVisibility FAILED for target.id=" + (target ? target.id : "")
			);
		}
	}

	function checkActivateCallCount(view, count, skipActiveCheck) {
		if (view) {
			assert.deepEqual(view.beforeActivateCallCount, count,
				view.id + " beforeActivateCallCount should be " + count);
			assert.deepEqual(view.afterActivateCallCount, count,
				view.id + " afterActivateCallCount should be " + count);

			//also test for view._active being set correctly to true
			if (!skipActiveCheck) {
				assert.isTrue(view._active, "view_active should be true for " + view.id);
			}
		}
	}

	function checkDeactivateCallCount(view, count, skipActiveCheck) {
		if (view) {
			assert.deepEqual(view.beforeDeactivateCallCount, count,
				view.id + " beforeDeactivateCallCount should be " + count);
			assert.deepEqual(view.afterDeactivateCallCount, count,
				view.id + " afterDeactivateCallCount should be " + count);

			//also test for view._active being set correctly to false
			if (!skipActiveCheck) {
				assert.isFalse(view._active, "view_active should be false for " + view.id);
			}
		}
	}

	// strip out single line comments from the json config
	function stripComments(jsonData) {
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		return jsonData;
	}

});
