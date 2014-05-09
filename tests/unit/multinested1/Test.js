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
	"requirejs-text/text!dapp/tests/unit/multinested1/app1.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, main, viewUtils, json, topic, on, domGeom, domClass, register, Deferred,
	multinested1config1) {
	// -------------------------------------------------------------------------------------- //
	// for multinested1Suite1 transition test
	var multinested1Container1, multinested1Node1;
	var multinested1HtmlContent1 =
		"<d-linear-layout id='multinested1App1linearlayout' style='height:500px'>" +
		"</d-linear-layout>";

	var multinested1Suite1 = {
		name: "multinested1Suite1: test app transitions",
		setup: function () {
			appName = "multinested1App1"; // this is from the config
			multinested1Container1 = document.createElement("div");
			document.body.appendChild(multinested1Container1);
			multinested1Container1.innerHTML = multinested1HtmlContent1;
			register.parse(multinested1Container1);
			multinested1Node1 = document.getElementById("multinested1App1linearlayout");
			testApp = null;
			multinested1App1P1View = null;
			multinested1App1S1View = null;
			multinested1App1V1View = null;
			multinested1App1V7View = null;
			multinested1App1Content = null;
			multinested1App1P2V1View = null;
			multinested1App1P2View = null;
			multinested1App1P2V2View = null;


		},
		"test initial view": function () {
			var d = this.async(10000);

			var appStartedDef1 = main(json.parse(stripComments(multinested1config1)), multinested1Container1);
			appStartedDef1.then(function (app) {
				// we are ready to test
				testApp = app;
				console.log("appStartedDef1.then called ");

				var multinested1App1P1 = document.getElementById("content_P1");
				multinested1App1ContentView = viewUtils.getViewFromViewId(testApp, "content");
				multinested1App1Content = multinested1App1ContentView.containerNode;

				// Here multinested1App1Home1View should be displayed

				multinested1App1P1View = viewUtils.getViewFromViewId(testApp, "content_P1");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(multinested1Node1, "root multinested1Node1 must be here");
				assert.isNotNull(multinested1App1P1, "multinested1App1Home1 view must be here");

				setTimeout(function () { // try timeout to wait for afterAcivate...
					d.resolve();
				}, 300);
			});
			return d;
		},

		// Currently showing P1_S1_V1 test transition to V7
		"multinested1App1Content.show(V7)": function () {
			var d = this.async(20000);
			multinested1App1Content.show("V7").then(function (complete) {
				//temp test works on IE but does not help on FF
				//var displayDeferred = new Deferred();
				//displayDeferred.then(function (complete) {
				// TODO: NOTE this test fails on FF, and IE, the lines above work on IE, but not on FF.
				// TODO: The failure seems to be caused by ViewStack not being notified with the transitionend for
				// this case.
				// there is a comment in the code saying transitionEnd events can be dropped on aggressive interactions
				var multinested1App1V7 = document.getElementById("content_V7");

				checkNodeVisibility(multinested1App1Content, multinested1App1V7);

				multinested1App1V7View = viewUtils.getViewFromViewId(testApp, "content_V7");
				multinested1App1S1View = viewUtils.getViewFromViewId(testApp, "content_P1_S1");
				multinested1App1V1View = viewUtils.getViewFromViewId(testApp, "content_P1_S1_V1");

				// Now multinested1App1V2View ActivateCallCounts should be 1
				checkActivateCallCount(multinested1App1V7View, 1);

				// Now multinested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multinested1App1V1View, 1);
				checkDeactivateCallCount(multinested1App1S1View, 1);
				checkDeactivateCallCount(multinested1App1P1View, 1);

				d.resolve();
			});
			// temp test works on IE but does not help on FF
			//testApp.showOrHideViews('content,V7', {
			//displayDeferred: displayDeferred
			//});
		},

		// Currently showing V7 test transition to P1_S1_V1
		"multinested1App1Content.show(P1) will show P1,S1,V": function () {
			var d = this.async(10000);
			multinested1App1Content.show("P1").then(function (complete) {
				var multinested1App1V1 = document.getElementById("content_P1_S1_V1");
				checkNestedNodeVisibility(multinested1App1Content, multinested1App1V1);

				// Now multinested1App1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multinested1App1S1View, 2);
				checkActivateCallCount(multinested1App1V1View, 2);
				checkActivateCallCount(multinested1App1P1View, 2);

				// Now multinested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multinested1App1V7View, 1);

				d.resolve();
			});
		},

		// Currently showing P1,S1,V1 test transition to P1_S1_V2
		"multinested1App1S1View.containerNode.show('V2') will show P1,S1,V2": function () {
			var d = this.async(10000);
			multinested1App1S1View.containerNode.show('V2').then(function (complete) {
				var multinested1App1V2 = document.getElementById("content_P1_S1_V2");
				checkNestedNodeVisibility(multinested1App1Content, multinested1App1V2);

				multinested1App1V2View = viewUtils.getViewFromViewId(testApp, "content_P1_S1_V2");

				// Now multinested1App1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multinested1App1V2View, 1);
				checkActivateCallCount(multinested1App1V1View, 2, true);
				checkActivateCallCount(multinested1App1S1View, 3);
				checkActivateCallCount(multinested1App1P1View, 3);

				// Now multinested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multinested1App1V7View, 1);
				checkDeactivateCallCount(multinested1App1V1View, 2);
				checkDeactivateCallCount(multinested1App1S1View, 2, true);
				checkDeactivateCallCount(multinested1App1P1View, 2, true);

				d.resolve();
			});
		},

		// Currently showing P1_S1_V2 test transition to V7
		"testApp.showOrHideViews('content,V7')": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var multinested1App1V7 = document.getElementById("content_V7");

				checkNodeVisibility(multinested1App1Content, multinested1App1V7);

				// Now multinested1App1V2View ActivateCallCounts should be 1
				checkActivateCallCount(multinested1App1V7View, 2);

				// Now multinested1App1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multinested1App1V2View, 1, true);
				checkActivateCallCount(multinested1App1V1View, 2, true);
				checkActivateCallCount(multinested1App1S1View, 3, true);
				checkActivateCallCount(multinested1App1P1View, 3, true);

				// Now multinested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multinested1App1V7View, 1, true);
				checkDeactivateCallCount(multinested1App1V1View, 2);
				checkDeactivateCallCount(multinested1App1V2View, 1);
				checkDeactivateCallCount(multinested1App1S1View, 3);
				checkDeactivateCallCount(multinested1App1P1View, 3);

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
				var multinested1App1V1 = document.getElementById("content_P1_S1_V1");
				checkNestedNodeVisibility(multinested1App1Content, multinested1App1V1);

				// Now multinested1App1V2View ActivateCallCounts as follows
				checkActivateCallCount(multinested1App1V7View, 2, true);
				checkActivateCallCount(multinested1App1V2View, 1, true);
				checkActivateCallCount(multinested1App1V1View, 3);
				checkActivateCallCount(multinested1App1S1View, 4);
				checkActivateCallCount(multinested1App1P1View, 4);

				// Now multinested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multinested1App1V7View, 2);
				checkDeactivateCallCount(multinested1App1V1View, 2, true);
				checkDeactivateCallCount(multinested1App1V2View, 1, true);
				checkDeactivateCallCount(multinested1App1S1View, 3, true);
				checkDeactivateCallCount(multinested1App1P1View, 3, true);


				d.resolve();
			});
			testApp.showOrHideViews('content,P1', {
				displayDeferred: displayDeferred
			});
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V1
		"multinested1App1Content.show('P2') will show P2,P2S1,P2V1": function () {
			var d = this.async(10000);
			multinested1App1Content.show('P2').then(function (complete) {
				var multinested1App1P2V1 = document.getElementById("content_P2_P2S1_P2V1");
				checkNestedNodeVisibility(multinested1App1Content, multinested1App1P2V1);

				multinested1App1P2V1View = viewUtils.getViewFromViewId(testApp, "content_P2_P2S1_P2V1");

				// Now multinested1App1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multinested1App1P2V1View, 1);
				checkActivateCallCount(multinested1App1V7View, 2, true);
				checkActivateCallCount(multinested1App1V2View, 1, true);
				checkActivateCallCount(multinested1App1V1View, 3, true);
				checkActivateCallCount(multinested1App1S1View, 4, true);
				checkActivateCallCount(multinested1App1P1View, 4, true);

				// Now multinested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multinested1App1V7View, 2, true);
				checkDeactivateCallCount(multinested1App1V1View, 3);
				checkDeactivateCallCount(multinested1App1V2View, 1, true);
				checkDeactivateCallCount(multinested1App1S1View, 4, true);
				checkDeactivateCallCount(multinested1App1P1View, 4, true);

				d.resolve();
			});
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V1
		"testApp.showOrHideViews('-content') will hide P2,P2S1,P2V1": function () {
			var d = this.async(10000);
			document.getElementById("content").parentNode.hide(document.getElementById("content").id).then(
				function (complete) {
					var multinested1App1P2V2 = document.getElementById("content_P2_P2S1_P2V2");
					multinested1App1P2V2View = viewUtils.getViewFromViewId(testApp, "content_P2_P2S1_P2V2");

					//	checkNestedNodeVisibility(multinested1App1Content, multinested1App1P2V1);
					assert.isNull(multinested1App1P2V2);
					assert.isNull(testApp.children.content.domNode.parentNode);



					// Now multinested1App1P2V1View ActivateCallCounts should be 1
					checkActivateCallCount(multinested1App1P2V1View, 1, true);
					checkActivateCallCount(multinested1App1V7View, 2, true);
					checkActivateCallCount(multinested1App1V2View, 1, true);
					checkActivateCallCount(multinested1App1V1View, 3, true);
					checkActivateCallCount(multinested1App1S1View, 4, true);
					checkActivateCallCount(multinested1App1P1View, 4, true);

					// Now multinested1App1P2V1View DeactivateCallCounts should be 1
					checkDeactivateCallCount(multinested1App1P2V1View, 1);
					checkDeactivateCallCount(multinested1App1V7View, 2, true);
					checkDeactivateCallCount(multinested1App1V1View, 3, true);
					checkDeactivateCallCount(multinested1App1V2View, 1, true);
					checkDeactivateCallCount(multinested1App1S1View, 4, true);
					checkDeactivateCallCount(multinested1App1P1View, 4, true);

					d.resolve();
				});
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V2
		"testApp.showOrHideViews('content,P2,P2S1,P2V2') will show P2,P2S1,P2V2": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var multinested1App1P2V2 = document.getElementById("content_P2_P2S1_P2V2");
				checkNestedNodeVisibility(multinested1App1Content, multinested1App1P2V2);

				multinested1App1P2V2View = viewUtils.getViewFromViewId(testApp, "content_P2_P2S1_P2V2");

				// Now multinested1App1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multinested1App1P2V2View, 1);
				checkActivateCallCount(multinested1App1V7View, 2, true);
				checkActivateCallCount(multinested1App1V2View, 1, true);
				checkActivateCallCount(multinested1App1V1View, 3, true);
				checkActivateCallCount(multinested1App1S1View, 4, true);
				checkActivateCallCount(multinested1App1P1View, 4, true);

				// Now multinested1App1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multinested1App1V7View, 2, true);
				checkDeactivateCallCount(multinested1App1V1View, 3);
				checkDeactivateCallCount(multinested1App1V2View, 1, true);
				checkDeactivateCallCount(multinested1App1S1View, 4, true);
				checkDeactivateCallCount(multinested1App1P1View, 4, true);

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
					var multinested1App1P2V2 = document.getElementById("content_P2_P2S1_P2V2");
					multinested1App1P2V2View = viewUtils.getViewFromViewId(testApp, "content_P2_P2S1_P2V2");
					multinested1App1P2S1View = viewUtils.getViewFromViewId(testApp, "content_P2_P2S1");

					//	checkNestedNodeVisibility(multinested1App1Content, multinested1App1P2V2);
					assert.isNull(multinested1App1P2V2);
					assert.isNull(multinested1App1P2S1View.domNode.parentNode);



					// Now multinested1App1P2V1View ActivateCallCounts should be 1
					checkActivateCallCount(multinested1App1P2V2View, 1, true);
					checkActivateCallCount(multinested1App1V7View, 2, true);
					checkActivateCallCount(multinested1App1V2View, 1, true);
					checkActivateCallCount(multinested1App1V1View, 3, true);
					checkActivateCallCount(multinested1App1S1View, 4, true);
					checkActivateCallCount(multinested1App1P1View, 4, true);

					// Now multinested1App1P2V1View DeactivateCallCounts should be 1
					checkDeactivateCallCount(multinested1App1P2V2View, 1);
					checkDeactivateCallCount(multinested1App1V7View, 2, true);
					checkDeactivateCallCount(multinested1App1V1View, 3, true);
					checkDeactivateCallCount(multinested1App1V2View, 1, true);
					checkDeactivateCallCount(multinested1App1S1View, 4, true);
					checkDeactivateCallCount(multinested1App1P1View, 4, true);

					d.resolve();
				});
		},

		teardown: function () {
			// call unloadApp to cleanup and end the test
			multinested1Container1.parentNode.removeChild(multinested1Container1);
			testApp.unloadApp();
		}
	};

	registerSuite(multinested1Suite1);

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
