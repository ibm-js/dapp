// quotmark:false needed for the inline html
// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/Application",
	"dapp/utils/view",
	"dojo/json",
	"delite/register",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/sidePaneViewsActivateCalls/app1.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, viewUtils, json, register, Deferred,
	sidePaneViewsActivateCallsconfig1) {
	// -------------------------------------------------------------------------------------- //
	// for sidePaneViewsActivateCallsSuite1 transition test
	var sidePaneViewsActivateCallsContainer1, sidePaneViewsActivateCallsNode1;
	var sidePaneViewsActivateCallsHtmlContent1 =
		'<div style="position: relative; height: 500px"> ' +
		'	<d-side-pane mode="push" position="start" id="sp1leftPane" style="background-color: lavender;">' +
		'</d-side-pane>' +
		'	<d-linear-layout style="width:100%; height: 100%">' +
		'		<d-view-stack id="sp1headerViewStack" style="width: 100%; height: 10%;"></d-view-stack>' +
		'		<d-linear-layout id="sp1centerLinearLayout" style="width:100%; height: 100%" vertical="false">' +
		'</d-linear-layout>' +
		'		<d-view-stack id="sp1footerViewStack" style="width: 100%; height: 10%;"></d-view-stack>' +
		'	</d-linear-layout>' +
		'<d-side-pane mode="push" position="end" id="sp1rightPane"  style="background-color: lightgoldenrodyellow;">' +
		'</d-side-pane>' +
		'</div>';

	var testApp = null;
	var sp1right1View = null;

	var sidePaneViewsActivateCallsSuite1 = {
		name: "sidePaneViewsActivateCallsSuite1: test app transitions",
		setup: function () {

			sidePaneViewsActivateCallsContainer1 = document.createElement("div");
			document.body.appendChild(sidePaneViewsActivateCallsContainer1);
			sidePaneViewsActivateCallsContainer1.innerHTML = sidePaneViewsActivateCallsHtmlContent1;
			register.parse(sidePaneViewsActivateCallsContainer1);
			sidePaneViewsActivateCallsNode1 =
				document.getElementById("sidePaneViewsActivateCallsApp1linearlayout");


		},
		"sidePaneViewsActivateCalls test initial view": function () {
			this.timeout = 20000;

			var appStartedDef1 = new Application(json.parse(stripComments(sidePaneViewsActivateCallsconfig1)),
				sidePaneViewsActivateCallsContainer1);
			return appStartedDef1.then(function (app) {
				// we are ready to test
				testApp = app;

				//verify these are showing "defaultView": "sp1header1+sp1centerParent+sp1center1+sp1right1+sp1footer1",

				var sp1header1View = viewUtils.getViewFromViewId(testApp, "sp1header1");
				checkActivateCallCount(sp1header1View, 1);
				var sp1header1content = sp1header1View.containerNode;
				assert.isNotNull(sp1header1content, "sp1header1content must be here");

				var sp1center1View = viewUtils.getViewFromViewId(testApp, "sp1center1");
				checkActivateCallCount(sp1center1View, 1);
				var sp1center1content = sp1header1View.containerNode;
				assert.isNotNull(sp1center1content, "sp1center1 must be here");

				var sp1right1View = viewUtils.getViewFromViewId(testApp, "sp1right1");
				checkActivateCallCount(sp1right1View, 1);
				var sp1right1content = sp1right1View.containerNode;
				assert.isNotNull(sp1right1content, "sp1right1content must be here");
				checkNodeVisibile(sp1right1content);

				var sp1footer1View = viewUtils.getViewFromViewId(testApp, "sp1footer1");
				checkActivateCallCount(sp1footer1View, 1);
				var sp1footer1content = sp1footer1View.containerNode;
				assert.isNotNull(sp1footer1content, "sp1footer1content must be here");
			});
		},
		// Currently showing sp1header1+sp1centerParent+sp1center1+sp1right1+sp1footer1 test
		// showOrHideViews('-sp1right1'
		"Hide sp1right1 with testApp.showOrHideViews('-sp1right1')": function () {
			this.timeout = 20000;
			var displayDeferred = new Deferred();
			testApp.showOrHideViews('-sp1right1', {
				displayDeferred: displayDeferred
			});
			return displayDeferred.then(function () {
				var sp1rightPane = document.getElementById("sp1rightPane");
				assert.isTrue(sp1rightPane.style.display === "none");
				checkActivateCallCount(sp1right1View, 1, true);
				checkDeactivateCallCount(sp1right1View, 1, true);
			});
		},
		// Currently showing sp1header1+sp1centerParent+sp1center1+sp1footer1 test
		// showOrHideViews('leftParent,left1'
		"show sp1left1 with testApp.showOrHideViews('sp1leftParent,sp1left1')": function () {
			this.timeout = 20000;
			var displayDeferred = new Deferred();
			testApp.showOrHideViews('sp1leftParent,sp1left1', {
				displayDeferred: displayDeferred
			});
			return displayDeferred.then(function () {
				var sp1left1content = document.getElementById("sp1leftParent_sp1left1");
				var sp1left1View = viewUtils.getViewFromViewId(testApp, "sp1leftParent_sp1left1");

				checkNodeVisibile(sp1left1content);
				checkActivateCallCount(sp1left1View, 1, true);
			});
		},
		// Currently showing sp1header1+sp1centerParent+sp1center1+sp1footer1+sp1leftParent,sp1left1 test
		// showOrHideViews('-sp1leftParent') when I used showOrHideViews('-sp1leftParent-sp1leftParent,left1') it
		// got a warning because sp1leftParent was not found as the parent of left1
		"Hide sp1left1 with testApp.showOrHideViews('-sp1leftParent')": function () {
			this.timeout = 20000;
			var displayDeferred = new Deferred();
			testApp.showOrHideViews('-sp1leftParent', {
				displayDeferred: displayDeferred
			});
			return displayDeferred.then(function () {
				var sp1rightPane = document.getElementById("sp1rightPane");
				var sp1left1content = document.getElementById("sp1leftPane");
				var sp1left1View = viewUtils.getViewFromViewId(testApp, "sp1leftParent_sp1left1");
				assert.isTrue(sp1rightPane.style.display === "none");
				assert.isTrue(sp1left1content.style.display === "none");

				checkActivateCallCount(sp1left1View, 1, true);
				checkDeactivateCallCount(sp1left1View, 1, true);
			});
		},
		// Currently showing sp1header1+sp1centerParent+sp1center1+sp1footer1 test
		// sp1rightPaneElem.show('sp1right2')
		"show sp1right2 with sp1rightPaneElem.show('sp1right2')": function () {
			this.timeout = 20000;
			var sp1rightPaneElem = document.getElementById("sp1rightPane");
			return sp1rightPaneElem.show('sp1right2').then(function () {
				var sp1right2View = viewUtils.getViewFromViewId(testApp, "sp1right2");
				checkActivateCallCount(sp1right2View, 1);
				var sp1right2content = sp1right2View.containerNode;
				assert.isNotNull(sp1right2content, "sp1right2content must be here");
				checkNodeVisibile(sp1right2content);
			});
		},
		// Currently showing sp1header1+sp1centerParent+sp1center1+sp1footer1 test
		// sp1rightPaneElem.hide('sp1right2')
		"hide sp1right2 with sp1rightPaneElem.hide('sp1right2')": function () {
			this.timeout = 20000;
			var sp1rightPaneElem = document.getElementById("sp1rightPane");
			return sp1rightPaneElem.hide('sp1right2').then(function () {
				var sp1right2View = viewUtils.getViewFromViewId(testApp, "sp1right2");
				checkDeactivateCallCount(sp1right2View, 1);
				var sp1right2content = sp1right2View.containerNode;
				assert.isNotNull(sp1right2content, "sp1right2content must be here");
				//	checkNodeVisibile(sp1right2content);
				assert.isTrue(sp1right2View.domNode.style.display === "none");
				assert.isTrue(sp1rightPaneElem.style.display === "none");
			});
		},

		teardown: function () {
			// call unloadApp to cleanup and end the test
			sidePaneViewsActivateCallsContainer1.parentNode.removeChild(
				sidePaneViewsActivateCallsContainer1);
			testApp.unloadApp();
		}
	};

	registerSuite(sidePaneViewsActivateCallsSuite1);

	function checkNodeVisibile(target) {
		assert.isTrue(target.style.display !== "none", target.id + " should be visible, but it is not");
	}

	function checkActivateCallCount(view, count, skipActiveCheck) {
		if (view) {
			assert.deepEqual(view._beforeActivateCallCount, count,
				view.id + " _beforeActivateCallCount should be " + count);
			assert.deepEqual(view._afterActivateCallCount, count,
				view.id + " _afterActivateCallCount should be " + count);

			//also test for view._active being set correctly to true
			if (!skipActiveCheck) {
				assert.isTrue(view._active, "view_active should be true for " + view.id);
			}
		}
	}

	function checkDeactivateCallCount(view, count, skipActiveCheck) {
		if (view) {
			assert.deepEqual(view._beforeDeactivateCallCount, count,
				view.id + " _beforeDeactivateCallCount should be " + count);
			assert.deepEqual(view._afterDeactivateCallCount, count,
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
