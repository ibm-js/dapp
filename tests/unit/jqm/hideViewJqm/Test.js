require(["jquery"],
	function ($) {
		// this must be setup after jquery is loaded, but before jquery.mobile is loaded
		$(document).bind("mobileinit", function () {
			// if this is set true to see if it helps things
			//	$.mobile.reload = true;

			// if this is set false the app must call $.mobile.initializePage();
			$.mobile.autoInitializePage = false;

			// Prevents all anchor click handling
			$.mobile.linkBindingEnabled = false;

			// Disabling this will prevent jQuery Mobile from handling hash changes
			// if enabled History controller should not be used.
			$.mobile.hashListeningEnabled = false;

			// keep all previously-visited pages in the DOM
			$.mobile.page.prototype.options.domCache = true;

			// the hash in the location bar should not be updated by jquery.mobile
			$.mobile.changePage.defaults.changeHash = false;
		});
	});

// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dojo/when",
	"dapp/Application",
	"dapp/utils/view",
	"requirejs-text/text!dapp/tests/unit/jqm/hideViewJqm/app.json",
	"jquery",
	"jquery.mobile",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, when, Application, viewUtils, jqmhideViewJqmconfig, $) {
	// -------------------------------------------------------------------------------------- //
	// for jqmhideViewJqmSuite
	var jqmhideViewJqmContainer3,
		testApp,
		hideViewJqmAppHome1View,
		hideViewJqmAppHome2View,
		jqmhideViewJqmNode3;

	var jqmhideViewJqmHtmlContent3 =
		'<div id="mainPnodeJQM"> <div id="dummyPage" data-role="page"></div></div>';
	//	'<div id="mainPnodeJQM"> <div id="dummyPage" data-role="page"></div>' +
	// '<div id="homeContainer" data-role="page"></div><div id="detailContainer" data-role="page"></div></div></div>';

	var jqmhideViewJqmSuite = {
		name: "jqmhideViewJqmSuite dapp jqmhideViewJqm: test app transitions",
		setup: function () {
			document.body.innerHTML = jqmhideViewJqmHtmlContent3;
			jqmhideViewJqmNode3 = document.getElementById("hideViewJqmAppdviewStack");
			// don't forget to trigger jquery.mobile manually
			if ($.mobile.autoInitializePage === false) {
				$.mobile.initializePage();
			}
		},
		"jqmhideViewJqmSuite dapp jqmhideViewJqm test initial layout": function () {
			this.timeout = 20000;

			return when(new Application(JSON.parse(stripComments(jqmhideViewJqmconfig)),
				jqmhideViewJqmContainer3).then(function (app) {
				// we are ready to test
				testApp = app;

				//var hideViewJqmAppHome1 = document.getElementById("hideViewJqmAppHome1");
				hideViewJqmAppHome1View = viewUtils.getViewFromViewId(testApp, "hideViewJqmAppHome1");
				assert.strictEqual(hideViewJqmAppHome1View._beforeActivateCallCount, 1,
					"hideViewJqmAppHome1View._beforeActivateCallCount should be 1");
			}));
		},
		"Test showOrHideViews('hideViewJqmAppHome2' ": function () {
			this.timeout = 20000;
			return when(testApp.showOrHideViews('hideViewJqmAppHome2')
				.then(function () {
					hideViewJqmAppHome2View = viewUtils.getViewFromViewId(testApp, "hideViewJqmAppHome2");
					checkActivateCallCount(hideViewJqmAppHome2View, 1);
					checkDeactivateCallCount(hideViewJqmAppHome1View, 1);
				}));
		},
		"Test showOrHideViews('hideViewJqmAppHome1' ": function () {
			this.timeout = 20000;
			return when(testApp.showOrHideViews('hideViewJqmAppHome1')
				.then(function () {
					checkActivateCallCount(hideViewJqmAppHome1View, 2);
					checkDeactivateCallCount(hideViewJqmAppHome2View, 1);
				}));
		},
		"Test showOrHideViews('-hideViewJqmAppHome1' ": function () {
			this.timeout = 20000;
			return when(testApp.showOrHideViews('-hideViewJqmAppHome1')
				.then(function () {
					//checkActivateCallCount(hideViewJqmAppHome1View, 2);
					checkDeactivateCallCount(hideViewJqmAppHome1View, 2);
				}));
		},
		"Test showOrHideViews('hideViewJqmAppHome2') again ": function () {
			this.timeout = 20000;
			return when(testApp.showOrHideViews('hideViewJqmAppHome2')
				.then(function () {
					checkActivateCallCount(hideViewJqmAppHome2View, 2);
					checkDeactivateCallCount(hideViewJqmAppHome1View, 2);
				}));
		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			var mainNode = document.getElementById("mainPnodeJQM");
			mainNode.parentNode.removeChild(mainNode);
			testApp.unloadApp();
			// this is to reset the url so that a browser refresh can rerun the tests
			location.hash = "?config=tests/intern.browser";
			history.pushState(null, null, location.href.replace(/#/, ''));
		}
	};

	registerSuite(jqmhideViewJqmSuite);

	function checkActivateCallCount(view, count) {
		if (view) {
			assert.strictEqual(view._beforeActivateCallCount, count,
				view.id + " _beforeActivateCallCount should be " + count);
			assert.strictEqual(view._afterActivateCallCount, count,
				view.id + " _afterActivateCallCount should be " + count);

			//also test for selectedChildren being set correctly with constraint main
			var selectedChildId = testApp.selectedChildren.center.id;
			assert.strictEqual(view.id, selectedChildId, view.id + " should be in testApp.selectedChildren.center. ");

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
