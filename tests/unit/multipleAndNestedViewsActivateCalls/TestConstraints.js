// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"decor/sniff",
	"requirejs-dplugins/Promise!",
	"dojo/when",
	"dapp/Application",
	"dapp/utils/view",
	"delite/register",
	"requirejs-text/text!dapp/tests/unit/multipleAndNestedViewsActivateCalls/app1Constraints.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, has, Promise, when, Application, viewUtils, register,
	multipleAndNestedViewsActivateCallsconfig1) {

	// -------------------------------------------------------------------------------------- //
	// for multipleAndNestedViewsActivateCallsConstraintsSuite1 transition test
	var multipleAndNestedViewsActivateCallsContainer1, multipleAndNestedViewsActivateCallsNode1;
	// TODO: multipleAndNestedViewsActivateCallsApp1linearlayout is a duplicate id, I expect that to be a problem!
	var multipleAndNestedViewsActivateCallsHtmlContent1 =
		"<d-linear-layout id='multipleAndNestedViewsActivateCallsApp1linearlayout' style='height:500px'>" +
		"</d-linear-layout>";

	var testApp = null;
	var multipleAndNestedViewsActivateCallsApp1P1View = null;
	var multipleAndNestedViewsActivateCallsApp1S1View = null;
	var multipleAndNestedViewsActivateCallsApp1V1View = null;
	var multipleAndNestedViewsActivateCallsApp1V7View = null;
	var multipleAndNestedViewsActivateCallsApp1Content = null;
	var multipleAndNestedViewsActivateCallsApp1P2V1View = null;
	var multipleAndNestedViewsActivateCallsApp1P2V2View = null;
	var multipleAndNestedViewsActivateCallsApp1V2View = null;
	var multipleAndNestedViewsActivateCallsApp1P2S1View = null;

	var multipleAndNestedViewsActivateCallsConstraintsSuite1 = {
		name: "multipleAndNestedViewsActivateCallsConstraintsSuite1: test app transitions",
		setup: function () {
			multipleAndNestedViewsActivateCallsContainer1 = document.createElement("div");
			document.body.appendChild(multipleAndNestedViewsActivateCallsContainer1);
			multipleAndNestedViewsActivateCallsContainer1.innerHTML = multipleAndNestedViewsActivateCallsHtmlContent1;
			register.parse(multipleAndNestedViewsActivateCallsContainer1);
			multipleAndNestedViewsActivateCallsNode1 =
				document.getElementById("multipleAndNestedViewsActivateCallsApp1linearlayout");

		},
		beforeEach: function () {
			return new Promise(function (resolve) {
				setTimeout(resolve, 50);
			});
		},
		"test initial view": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}

			return when(new Application(JSON.parse(stripComments(multipleAndNestedViewsActivateCallsconfig1)),
				multipleAndNestedViewsActivateCallsContainer1).then(function (app) {
				// we are ready to test
				testApp = app;

				var multipleAndNestedViewsActivateCallsApp1P1 = document.getElementById("contentCons_P1");
				var multipleAndNestedViewsActivateCallsApp1ContentView =
					viewUtils.getViewFromViewId(testApp, "contentCons");
				multipleAndNestedViewsActivateCallsApp1Content =
					multipleAndNestedViewsActivateCallsApp1ContentView.containerNode;

				// Here multipleAndNestedViewsActivateCallsApp1Home1View should be displayed

				multipleAndNestedViewsActivateCallsApp1P1View = viewUtils.getViewFromViewId(testApp, "contentCons_P1");
				// check the DOM state to see if we are in the expected state
				assert.isNotNull(multipleAndNestedViewsActivateCallsNode1,
					"root multipleAndNestedViewsActivateCallsNode1 must be here");
				assert.isNotNull(multipleAndNestedViewsActivateCallsApp1P1,
					"multipleAndNestedViewsActivateCallsApp1Home1 view must be here");
			}));
		},

		// Currently showing P1_S1_V1 test transition to V7
		"multipleAndNestedViewsActivateCallsApp1Content.show(V7)": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(multipleAndNestedViewsActivateCallsApp1Content.show("V7").then(function () {
				//temp test works on IE but does not help on FF
				// TODO: NOTE this test fails on FF, and IE, the lines above work on IE, but not on FF.
				// TODO: The failure seems to be caused by ViewStack not being notified with the transitionend for
				// this case.
				// there is a comment in the code saying transitionEnd events can be dropped on aggressive interactions
				var multipleAndNestedViewsActivateCallsApp1V7 = document.getElementById("contentCons_V7");

				checkNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1V7);

				multipleAndNestedViewsActivateCallsApp1V7View = viewUtils.getViewFromViewId(testApp, "contentCons_V7");
				multipleAndNestedViewsActivateCallsApp1S1View =
					viewUtils.getViewFromViewId(testApp, "contentCons_P1_S1");
				multipleAndNestedViewsActivateCallsApp1V1View = viewUtils.getViewFromViewId(testApp,
					"contentCons_P1_S1_V1");

				// Now multipleAndNestedViewsActivateCallsApp1V2View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 1);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 1);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 1);
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 1);
			}));
			// temp test works on IE but does not help on FF
			//testApp.showOrHideViews('content,V7');
		},

		// Currently showing V7 test transition to P1_S1_V1
		"multipleAndNestedViewsActivateCallsApp1Content.show(P1) will show P1,S1,V": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(multipleAndNestedViewsActivateCallsApp1Content.show("P1").then(function () {
				var multipleAndNestedViewsActivateCallsApp1V1 = document.getElementById("contentCons_P1_S1_V1");
				checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1V1);

				// Now multipleAndNestedViewsActivateCallsApp1V1View ActivateCallCounts should be 1
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 2);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 2);
				checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 2);

				// Now multipleAndNestedViewsActivateCallsApp1V1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 1);
			}));
		},

		// Currently showing P1,S1,V1 test transition to P1_S1_V2
		"multipleAndNestedViewsActivateCallsApp1S1View.containerNode.show('V2') will show P1,S1,V2": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(multipleAndNestedViewsActivateCallsApp1S1View.containerNode.show('V2').then(function () {
				var multipleAndNestedViewsActivateCallsApp1V2 = document.getElementById("contentCons_P1_S1_V2");
				checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1V2);

				multipleAndNestedViewsActivateCallsApp1V2View = viewUtils.getViewFromViewId(testApp,
					"contentCons_P1_S1_V2");

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
			}));
		},

		// Currently showing P1_S1_V2 test transition to V7
		"testApp.showOrHideViews('contentCons,V7')": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(testApp.showOrHideViews('contentCons,V7')
				.then(function () {
					var multipleAndNestedViewsActivateCallsApp1V7 = document.getElementById("contentCons_V7");

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
				}));
		},

		// Currently showing V7 test transition to P1_S1_V1
		"testApp.showOrHideViews('contentCons,P1') will show P1,S1,V1": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(testApp.showOrHideViews('contentCons,P1')
				.then(function () {
					var multipleAndNestedViewsActivateCallsApp1V1 = document.getElementById("contentCons_P1_S1_V1");
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
				}));
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V1
		"multipleAndNestedViewsActivateCallsApp1Content.show('P2') will show P2,P2S1,P2V1": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(multipleAndNestedViewsActivateCallsApp1Content.show('P2').then(function () {
				var multipleAndNestedViewsActivateCallsApp1P2V1 = document.getElementById("contentCons_P2_P2S1_P2V1");
				checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					multipleAndNestedViewsActivateCallsApp1P2V1);

				multipleAndNestedViewsActivateCallsApp1P2V1View = viewUtils.getViewFromViewId(testApp,
					"contentCons_P2_P2S1_P2V1");

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
			}));
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V1
		"testApp.showOrHideViews('-contentCons') will hide P2,P2S1,P2V1": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(
				document.getElementById("contentCons").parentNode.hide(document.getElementById("contentCons").id)
				.then(function () {
					var multipleAndNestedViewsActivateCallsApp1P2V2 =
						document.getElementById("contentCons_P2_P2S1_P2V2");
					multipleAndNestedViewsActivateCallsApp1P2V2View = viewUtils.getViewFromViewId(testApp,
						"contentCons_P2_P2S1_P2V2");

					//	checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					// 		multipleAndNestedViewsActivateCallsApp1P2V1);
					assert.isNull(multipleAndNestedViewsActivateCallsApp1P2V2);
					assert.isNull(testApp.childViews.contentCons.parentNode);



					// Now multipleAndNestedViewsActivateCallsApp1P2V1View ActivateCallCounts should be 1
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V1View, 1, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

					// Now multipleAndNestedViewsActivateCallsApp1P2V1View DeactivateCallCounts should be 1
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V1View, 0, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);
				}));
		},

		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V2
		"testApp.showOrHideViews('contentCons,P2,P2S1,P2V2') will show P2,P2S1,P2V2": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(testApp.showOrHideViews('contentCons,P2,P2S1,P2V2')
				.then(function () {
					var multipleAndNestedViewsActivateCallsApp1P2V2 =
						document.getElementById("contentCons_P2_P2S1_P2V2");
					checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
						multipleAndNestedViewsActivateCallsApp1P2V2);

					multipleAndNestedViewsActivateCallsApp1P2V2View = viewUtils.getViewFromViewId(testApp,
						"contentCons_P2_P2S1_P2V2");

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
				}));
		},

		//TODO: NOTE problem w/ -contentCons,P2!!! it hides P2,P2S1,P2V2
		// Currently showing P1,S1,V1 test transition to P2,P2S1,P2V1
		"testApp.showOrHideViews('-contentCons,P2,P2S1')": function () {
			this.timeout = 20000;
			// multipleAndNestedViewsActivateCallsConstraintsSuite1 is having problems on IE10, IE11 and FF
			if (has("ie") || has("ff")) {
				this.skip("Skipping this test on IE and FF.");
			}
			return when(document.getElementById("contentCons_P2_P2S1").parentNode.hide(
					document.getElementById("contentCons_P2_P2S1").id)
				.then(function () {
					var multipleAndNestedViewsActivateCallsApp1P2V2 =
						document.getElementById("contentCons_P2_P2S1_P2V2");
					multipleAndNestedViewsActivateCallsApp1P2V2View = viewUtils.getViewFromViewId(testApp,
						"contentCons_P2_P2S1_P2V2");
					multipleAndNestedViewsActivateCallsApp1P2S1View = viewUtils.getViewFromViewId(testApp,
						"contentCons_P2_P2S1");

					//	checkNestedNodeVisibility(multipleAndNestedViewsActivateCallsApp1Content,
					// multipleAndNestedViewsActivateCallsApp1P2V2);
					assert.isNull(multipleAndNestedViewsActivateCallsApp1P2V2);
					assert.isNull(multipleAndNestedViewsActivateCallsApp1P2S1View.parentNode);



					// Now multipleAndNestedViewsActivateCallsApp1P2V1View ActivateCallCounts should be 1
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V2View, 1, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
					checkActivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);

					// Now multipleAndNestedViewsActivateCallsApp1P2V1View DeactivateCallCounts should be 1
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P2V2View, 0, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V7View, 2, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V1View, 3, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1V2View, 1, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1S1View, 4, true);
					checkDeactivateCallCount(multipleAndNestedViewsActivateCallsApp1P1View, 4, true);
				}));
		},

		teardown: function () {
			// call unloadApp to cleanup and end the test
			multipleAndNestedViewsActivateCallsContainer1.parentNode.removeChild(
				multipleAndNestedViewsActivateCallsContainer1);
			if (testApp) {
				testApp.unloadApp();
			}
		}
	};

	registerSuite(multipleAndNestedViewsActivateCallsConstraintsSuite1);

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
			assert.strictEqual(view._beforeActivateCallCount, count,
				view.id + " _beforeActivateCallCount should be " + count);
			assert.strictEqual(view._afterActivateCallCount, count,
				view.id + " _afterActivateCallCount should be " + count);

			//also test for view._active being set correctly to true
			if (!skipActiveCheck) {
				assert.isTrue(view._active, "view_active should be true for " + view.id);
			}
		}
	}

	function checkDeactivateCallCount(view, count, skipActiveCheck) {
		if (view) {
			assert.strictEqual(view._beforeDeactivateCallCount, count,
				view.id + " _beforeDeactivateCallCount should be " + count);
			assert.strictEqual(view._afterDeactivateCallCount, count,
				view.id + " _afterDeactivateCallCount should be " + count);

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
