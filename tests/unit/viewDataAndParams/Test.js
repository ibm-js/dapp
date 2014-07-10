// jshint quotmark:false
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
	"requirejs-text/text!dapp/tests/unit/viewDataAndParams/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, viewUtils, json, topic, on, domGeom, domClass, register, Deferred,
	viewDataconfig3) {
	// -------------------------------------------------------------------------------------- //
	// for viewDataSuite transition test
	var viewDataContainer3,
		testApp,
		viewDataAndParamsAppHome1View,
		viewDataAndParamsAppHome3View,
		viewDataNode3;
	var viewDataHtmlContent3 =
		"<d-view-stack id='viewDataAndParamsAppdviewStack' " +
		"style='width: 100%; height: 100%; position: absolute !important'>" +
		"</d-view-stack>";

	var viewDataSuite = {
		name: "viewDataAndParamsSuite: test viewData And viewParams",
		setup: function () {
			viewDataContainer3 = document.createElement("div");
			document.body.appendChild(viewDataContainer3);
			viewDataContainer3.innerHTML = viewDataHtmlContent3;
			//	register.parse(viewDataContainer3);
			viewDataNode3 = document.getElementById("viewDataAndParamsAppdviewStack");
		},
		"test initial view": function () {
			this.timeout = 20000;

			return new Application(json.parse(stripComments(viewDataconfig3)), viewDataContainer3)
				.then(function (app) {
					// we are ready to test
					testApp = app;
					var viewDataAndParamsAppHome1 = document.getElementById("viewDataAndParamsAppHome1");
					// Here viewDataAndParamsAppHome1View should be displayed
					viewDataAndParamsAppHome1View = viewUtils.getViewFromViewId(testApp, "viewDataAndParamsAppHome1");
					// check that init has been called on these views
					assert.isTrue(viewDataAndParamsAppHome1View.initialized,
						"viewDataAndParamsAppHome1View.initialized should be true");
					// check the DOM state to see if we are in the expected state
					assert.isNotNull(viewDataAndParamsAppHome1, "viewDataAndParamsAppHome1 view must be here");
					assert.deepEqual(viewDataAndParamsAppHome1View._beforeActivateCallCount, 1,
						"viewDataAndParamsAppHome1View._beforeActivateCallCount should be 1");
					assert.isNotNull(viewDataNode3, "root viewDataNode3 must be here");
					checkNodeVisibility(viewDataNode3, viewDataAndParamsAppHome1);
				});
		},

		// Currently showing viewDataAndParamsAppHome1View test transition to viewDataAndParamsAppHome3View
		"viewDataNode3.show(viewDataAndParamsAppHome3)": function () {
			this.timeout = 20000;
			return viewDataNode3.show("viewDataAndParamsAppHome3").then(function () {
				var viewDataAndParamsAppHome3 = document.getElementById("viewDataAndParamsAppHome3");
				checkNodeVisibility(viewDataNode3, viewDataAndParamsAppHome3);
				viewDataAndParamsAppHome3View = viewUtils.getViewFromViewId(testApp, "viewDataAndParamsAppHome3");
				// Now viewDataAndParamsAppHome3 ActivateCallCounts should be 1
				checkActivateCallCount(viewDataAndParamsAppHome3View, 1);
				// Now viewDataAndParamsAppHome1View DeactivateCallCounts should be 1
				checkDeactivateCallCount(viewDataAndParamsAppHome1View, 1);
			});

		},

		// Currently showing viewDataAndParamsAppHome3 test transition back to viewDataAndParamsAppHome1
		"testApp.showOrHideViews('viewDataAndParamsAppHome1', params) tests data passed to view": function () {
			this.timeout = 20000;
			var displayDeferred = new Deferred();

			//	viewDataNode3.show("viewDataAndParamsAppHome1");
			var params = {
				viewData: {
					"p": "testData"
				},
				displayDeferred: displayDeferred
			};
			testApp.showOrHideViews('viewDataAndParamsAppHome1', params);
			return displayDeferred.then(function () {
				var viewDataAndParamsAppHome1 = document.getElementById("viewDataAndParamsAppHome1");
				checkNodeVisibility(viewDataNode3, viewDataAndParamsAppHome1);

				// Now viewDataAndParamsAppHome1View ActivateCallCounts should be 2
				checkActivateCallCount(viewDataAndParamsAppHome1View, 2);

				// Now viewDataAndParamsAppHome3View DeactivateCallCounts should be 1
				checkDeactivateCallCount(viewDataAndParamsAppHome3View, 1);

				assert.equal(viewDataAndParamsAppHome1View.viewData.p, "testData",
					"viewDataAndParamsAppHome1View.viewData should equal testData");
			});
		},

		// Currently showing viewDataAndParamsAppHome3 test transition back to viewDataAndParamsAppHome1
		"testApp.showOrHideViews('parentV1,s1', viewData) tests data passed to subview": function () {
			this.timeout = 20000;
			var displayDeferred = new Deferred();
			//	viewDataNode3.show("viewDataAndParamsAppHome1");
			var params = {
				viewData: {
					"p": "testData",
					"views": {
						"parentV1": {
							"fromParent": "valuefromParent"
						},
						"parentV1,s1": {
							"fromChild": "valuefromChild"
						}
					}
				},
				displayDeferred: displayDeferred
			};
			testApp.showOrHideViews('parentV1,s1', params);
			return displayDeferred.then(function () {
				//	var viewDataparentV1s1 = document.getElementById("parentV1_s1");
				var viewDataparentV1s1View = viewUtils.getViewFromViewId(testApp, "parentV1_s1");

				assert.equal(viewDataparentV1s1View.viewData.p, "testData",
					"viewDataparentV1s1View.viewData.p should equal testData");
				assert.equal(viewDataparentV1s1View.viewData.fromChild, "valuefromChild",
					"viewDataparentV1s1View.viewData.fromChild should equal valuefromChild");
				//NOTE: viewData is not inherited from parentView, so viewData.parentV1 is not set
				assert.isUndefined(viewDataparentV1s1View.viewData.fromParent,
					"viewDataparentV1s1View.viewData.fromParent should not be set");

				var viewDataparentV1View = viewUtils.getViewFromViewId(testApp, "parentV1");
				//NOTE: viewData with fromParent on viewDataparentV1View should be set
				assert.equal(viewDataparentV1View.viewData.fromParent, "valuefromParent",
					"viewDataparentV1View.viewData.fromParent should equal valuefromParent");
				assert.isUndefined(viewDataparentV1View.viewData.fromChild,
					"viewDataparentV1View.viewData.fromChild should not be set");
			});
		},

		// Currently showing viewDataAndParamsAppHome3 test transition back to viewDataAndParamsAppHome1
		"testApp.showOrHideViews('parentV1,s1', viewParams) tests params passed to subview": function () {
			this.timeout = 20000;
			var displayDeferred = new Deferred();
			//	viewDataNode3.show("viewDataAndParamsAppHome1");
			var params = {
				viewParams: {
					"p": "testData",
					"views": {
						"parentV1,s1": {
							"fromChild": "paramValuefromChild"
						},
						"parentV1": {
							"fromParent": "paramValuefromParent"
						}
					}
				},
				displayDeferred: displayDeferred
			};
			testApp.showOrHideViews('parentV1,s1', params);
			return displayDeferred.then(function () {
				//	var viewDataparentV1s1 = document.getElementById("parentV1_s1");
				var viewDataparentV1s1View = viewUtils.getViewFromViewId(testApp, "parentV1_s1");

				assert.equal(viewDataparentV1s1View.viewParams.p, "testData",
					"viewDataparentV1s1View.viewParams should equal testData");
				assert.equal(viewDataparentV1s1View.viewParams.fromParent, "paramValuefromParent",
					"viewDataparentV1s1View.viewParams.fromParent should equal paramValuefromParent");
				assert.equal(viewDataparentV1s1View.viewParams.fromChild, "paramValuefromChild",
					"viewDataparentV1s1View.viewParams.fromChild should equal paramValuefromChild");

				var viewDataparentV1View = viewUtils.getViewFromViewId(testApp, "parentV1");
				assert.equal(viewDataparentV1View.viewParams.p, "testData",
					"viewDataparentV1View.viewParams should equal testData");
				assert.equal(viewDataparentV1View.viewParams.fromParent, "paramValuefromParent",
					"viewDataparentV1View.viewParams.fromParent should equal paramValuefromParent");
				assert.isUndefined(viewDataparentV1View.viewParams.fromChild,
					"viewDataparentV1View.viewParams.fromChild should not be set");
			});
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
			assert.deepEqual(view._beforeActivateCallCount, count,
				view.id + " _beforeActivateCallCount should be " + count);
			assert.deepEqual(view._afterActivateCallCount, count,
				view.id + " _afterActivateCallCount should be " + count);

			//also test for selectedChildren being set correctly with constraint view.parentNode.id
			var selectedChildId = testApp.selectedChildren[view.parentNode.id].id;
			assert.deepEqual(view.id, selectedChildId, view.id +
				" should be in testApp.selectedChildren[view.parentNode.id]. ");

			//also test for view._active being set correctly to true
			assert.isTrue(view._active, "view_active should be true for " + view.id);
		}
	}

	function checkDeactivateCallCount(view, count) {
		if (view) {
			assert.deepEqual(view._beforeDeactivateCallCount, count,
				view.id + " _beforeDeactivateCallCount should be " + count);
			assert.deepEqual(view._afterDeactivateCallCount, count,
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
