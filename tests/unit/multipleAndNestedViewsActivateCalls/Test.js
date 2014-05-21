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
	"requirejs-text/text!dapp/tests/unit/multipleAndNestedViewsActivateCalls/app1.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, viewUtils, json, topic, on, domGeom, domClass, register, Deferred,
	multipleAndNestedViewsActivateCallsconfig1) {
	// -------------------------------------------------------------------------------------- //
	// for multipleAndNestedViewsActivateCallsSuite1 transition test
	var multipleAndNestedViewsActivateCallsContainer1, multipleAndNestedViewsActivateCallsNode1;
	var multipleAndNestedViewsActivateCallsHtmlContent1 =
		"<d-linear-layout id='multipleAndNestedViewsActivateCallsApp1linearlayout' style='height:500px'>" +
		"</d-linear-layout>";

	var multipleAndNestedViewsActivateCallsSuite1 = {
		name: "multipleAndNestedViewsActivateCallsSuite1: test app transitions",
		setup: function () {
			appName = "multipleAndNestedViewsActivateCallsApp1"; // this is from the config
			multipleAndNestedViewsActivateCallsContainer1 = document.createElement("div");
			document.body.appendChild(multipleAndNestedViewsActivateCallsContainer1);
			multipleAndNestedViewsActivateCallsContainer1.innerHTML = multipleAndNestedViewsActivateCallsHtmlContent1;
			register.parse(multipleAndNestedViewsActivateCallsContainer1);
			multipleAndNestedViewsActivateCallsNode1 =
				document.getElementById("multipleAndNestedViewsActivateCallsApp1linearlayout");
			testApp = null;
			multipleAndNestedViewsActivateCallsApp1P1View = null;
			multipleAndNestedViewsActivateCallsApp1S1View = null;
			multipleAndNestedViewsActivateCallsApp1V1View = null;
			multipleAndNestedViewsActivateCallsApp1V7View = null;
			multipleAndNestedViewsActivateCallsApp1Content = null;
			multipleAndNestedViewsActivateCallsApp1P2V1View = null;
			multipleAndNestedViewsActivateCallsApp1P2View = null;
			multipleAndNestedViewsActivateCallsApp1P2V2View = null;


		},
		"test initial view": function () {
			var d = this.async(10000);

			var appStartedDef1 = new Application(json.parse(stripComments(multipleAndNestedViewsActivateCallsconfig1)),
				multipleAndNestedViewsActivateCallsContainer1);
			appStartedDef1.then(function (app) {
				// we are ready to test
				testApp = app;
				console.log("appStartedDef1.then called ");

				var multipleAndNestedViewsActivateCallsApp1P1 = document.getElementById("content_P1");
				multipleAndNestedViewsActivateCallsApp1ContentView = viewUtils.getViewFromViewId(testApp, "content");
				multipleAndNestedViewsActivateCallsApp1Content =
					multipleAndNestedViewsActivateCallsApp1ContentView.containerNode;

				// Here multipleAndNestedViewsActivateCallsApp1Home1View should be displayed

				multipleAndNestedViewsActivateCallsApp1P1View = viewUtils.getViewFromViewId(testApp, "content_P1");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(multipleAndNestedViewsActivateCallsNode1,
					"root multipleAndNestedViewsActivateCallsNode1 must be here");
				assert.isNotNull(multipleAndNestedViewsActivateCallsApp1P1,
					"multipleAndNestedViewsActivateCallsApp1Home1 view must be here");

				setTimeout(function () { // try timeout to wait for afterAcivate...
					d.resolve();
				}, 300);
			});
			return d;
		},

		// Currently showing P1_S1_V1 test transition to V7
		"multipleAndNestedViewsActivateCallsApp1Content.show(V7)": function () {
			var d = this.async(20000);
			multipleAndNestedViewsActivateCallsApp1Content.show("V7").then(function (complete) {
				//temp test works on IE but does not help on FF
				//var displayDeferred = new Deferred();
				//displayDeferred.then(function (complete) {
				// TODO: NOTE this test fails on FF, and IE, the lines above work on IE, but not on FF.
				// TODO: The failure seems to be caused by ViewStack not being notified with the transitionend for
				// this case.
				// there is a comment in the code saying transitionEnd events can be dropped on aggressive interactions
				var multipleAndNestedViewsActivateCallsApp1V7 = document.getElementById("content_V7");

				checkNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1V7);

				multipleAndNestedViewsActivateCallsApp1V7View = viewUtils.getViewFromViewId(testApp, "content_V7");
				multipleAndNestedViewsActivateCallsApp1S1View = viewUtils.getViewFromViewId(testApp, "content_P1_S1");
				multipleAndNestedViewsActivateCallsApp1V1View = viewUtils.getViewFromViewId(testApp,
					"content_P1_S1_V1");

				// Now multipleAndNestedViewsActivateCallsApp1V2View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 1);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 1);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 1);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 1);

				d.resolve();
			});
			// temp test works on IE but does not help on FF
			//testApp.showOrHideViews('content,V7', {
			//displayDeferred: displayDeferred
			//});
		},

		// Currently showing V7 test transition to P1_S1_V1
		"multipleAndNestedViewsActivateCallsApp1Content.show(P1) will show P1,S1,V": function () {
			var d = this.async(10000);
			multipleAndNestedViewsActivateCallsApp1Content.show("P1").then(function (complete) {
				var multipleAndNestedViewsActivateCallsApp1V1 = document.getElementById("content_P1_S1_V1");
				checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1V1);

				// Now multipleAndNestedViewsActivateCallsApp1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 2);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 2);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 2);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 1);

				d.resolve();
			});
		},

		// Currently showing P1,S1,V1 test transition to P1_S1_V2
		"multipleAndNestedViewsActivateCallsApp1S1View.containerNode.show('V2') will show P1,S1,V2": function () {
			var d = this.async(10000);
			multipleAndNestedViewsActivateCallsApp1S1View.containerNode.show('V2').then(function (complete) {
				var multipleAndNestedViewsActivateCallsApp1V2 = document.getElementById("content_P1_S1_V2");
				checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1V2);

				multipleAndNestedViewsActivateCallsApp1V2View = viewUtils.getViewFromViewId(testApp,
					"content_P1_S1_V2");

				// Now multipleAndNestedViewsActivateCallsApp1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 2, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 3);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 3);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 1);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 2);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 2, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 2, true);

				d.resolve();
			});
		},

		// Currently showing P1_S1_V2 test transition to V7
		"testApp.showOrHideViews('content,V7')": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var multipleAndNestedViewsActivateCallsApp1V7 = document.getElementById("content_V7");

				checkNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1V7);

				// Now multipleAndNestedViewsActivateCallsApp1V2View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2);

				// Now multipleAndNestedViewsActivateCallsApp1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 2, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 3, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 3, true);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 1, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 2);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 3);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 3);

				d.resolve();
			});
			testApp.showOrHideViews('content,V7', {
				displayDeferred: displayDeferred
			});
		},

		// Currently showing V7 test transition to P1_S1_V1
		"testApp.showOrHideViews('content,P1') will show P1,S1,V1": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var multipleAndNestedViewsActivateCallsApp1V1 = document.getElementById("content_P1_S1_V1");
				checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1V1);

				// Now multipleAndNestedViewsActivateCallsApp1V2View ActivateCallCounts as follows
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 2, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 3, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 3, true);


				d.resolve();
			});
			testApp.showOrHideViews('content,P1', {
				displayDeferred: displayDeferred
			});
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V1
		"multipleAndNestedViewsActivateCallsApp1Content.show('P2') will show P2,P2S1,P2V1": function () {
			var d = this.async(10000);
			multipleAndNestedViewsActivateCallsApp1Content.show('P2').then(function (complete) {
				var multipleAndNestedViewsActivateCallsApp1P2V1 = document.getElementById("content_P2_P2S1_P2V1");
				checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1P2V1);

				multipleAndNestedViewsActivateCallsApp1P2V1View = viewUtils.getViewFromViewId(testApp,
					"content_P2_P2S1_P2V1");

				// Now multipleAndNestedViewsActivateCallsApp1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V1View, 1);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

				d.resolve();
			});
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V1
		"testApp.showOrHideViews('-content') will hide P2,P2S1,P2V1": function () {
			var d = this.async(10000);
			document.getElementById("content").parentNode.hide(document.getElementById("content").id).then(
				function (complete) {
					var multipleAndNestedViewsActivateCallsApp1P2V2 = document.getElementById("content_P2_P2S1_P2V2");
					multipleAndNestedViewsActivateCallsApp1P2V2View = viewUtils.getViewFromViewId(testApp,
						"content_P2_P2S1_P2V2");

					//	checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					// 		multipleAndNestedViewsActivateCallsApp1P2V1);
					assert.isNull(multipleAndNestedViewsActivateCallsApp1P2V2);
					assert.isNull(testApp.children.content.domNode.parentNode);



					// Now multipleAndNestedViewsActivateCallsApp1P2V1View ActivateCallCounts should be 1
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V1View, 1, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

					// Now multipleAndNestedViewsActivateCallsApp1P2V1View DeactivateCallCounts should be 1
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V1View, 1);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

					d.resolve();
				});
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V2
		"testApp.showOrHideViews('content,P2,P2S1,P2V2') will show P2,P2S1,P2V2": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var multipleAndNestedViewsActivateCallsApp1P2V2 = document.getElementById("content_P2_P2S1_P2V2");
				checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1P2V2);

				multipleAndNestedViewsActivateCallsApp1P2V2View = viewUtils.getViewFromViewId(testApp,
					"content_P2_P2S1_P2V2");

				// Now multipleAndNestedViewsActivateCallsApp1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V2View, 1);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

				d.resolve();
			});
			testApp.showOrHideViews('content,P2,P2S1,P2V2', {
				displayDeferred: displayDeferred
			});
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V1
		"testApp.showOrHideViews('-content,P2,P2S1') NOTE problem w/ -content,P2!!! hides P2,P2S1,P2V2": function () {
			var d = this.async(10000);
			document.getElementById("content_P2_P2S1").parentNode.hide(document.getElementById("content_P2_P2S1").id)
				.then(function (complete) {
					var multipleAndNestedViewsActivateCallsApp1P2V2 = document.getElementById("content_P2_P2S1_P2V2");
					multipleAndNestedViewsActivateCallsApp1P2V2View = viewUtils.getViewFromViewId(testApp,
						"content_P2_P2S1_P2V2");
					multipleAndNestedViewsActivateCallsApp1P2S1View = viewUtils.getViewFromViewId(testApp,
						"content_P2_P2S1");

					//	checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					// multipleAndNestedViewsActivateCallsApp1P2V2);
					assert.isNull(multipleAndNestedViewsActivateCallsApp1P2V2);
					assert.isNull(multipleAndNestedViewsActivateCallsApp1P2S1View.domNode.parentNode);



					// Now multipleAndNestedViewsActivateCallsApp1P2V1View ActivateCallCounts should be 1
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V2View, 1, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

					// Now multipleAndNestedViewsActivateCallsApp1P2V1View DeactivateCallCounts should be 1
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V2View, 1);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

					d.resolve();
				});
		},

		teardown: function () {
			// call unloadApp to cleanup and end the test
			multipleAndNestedViewsActivateCallsContainer1.parentNode.removeChild(
				multipleAndNestedViewsActivateCallsContainer1);
			testApp.unloadApp();
		}
	};

	registerSuite(multipleAndNestedViewsActivateCallsSuite1);

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
