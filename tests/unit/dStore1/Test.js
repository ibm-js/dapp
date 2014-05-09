// jshint unused:false, undef:false, quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dojo/_base/window",
	"dapp/main",
	"dojo/json",
	"dojo/topic",
	"dojo/on",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"delite/register",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/dStore1/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack",
	"deliteful/list/List",
	"dstore/Memory"
], function (registerSuite, assert, win, main, json, topic, on, domGeom, domClass, register, Deferred,
	dStore1config1) {
	// -------------------------------------------------------------------------------------- //
	// for dStore1Suite1 transition test
	var dStore1Container1, dStore1Node1;
	var dStore1HtmlContent1 =
		"<d-view-stack id='dStore1AppdviewStack' style='width: 100%; height: 100%;'>" +
		"</d-view-stack>";

	win.global.dStore1App = {};
	win.global.dStore1App.list1Data = {
		identifier: "id",
		'items': []
	};
	for (i = 1; i < 6; i++) {
		win.global.dStore1App.list1Data.items.push({
			label: "Selection " + i,
			id: i
		});
	}


	win.global.dStore1App.list2Data = {
		identifier: "id",
		'items': []
	};
	for (i = 6; i < 11; i++) {
		win.global.dStore1App.list2Data.items.push({
			label: "Selection " + i,
			id: i
		});
	}

	var dStore1Suite1 = {
		name: "dStore1Suite1: test app transitions",
		setup: function () {
			appName = "dStore1App1"; // this is from the config
			dStore1Container1 = document.createElement("div");
			document.body.appendChild(dStore1Container1);
			dStore1Container1.innerHTML = dStore1HtmlContent1;
			//	register.parse(dStore1Container1); // no need to call parse here since config has "parseOnLoad": true
			dStore1Node1 = null;
			testApp = null;
			dStore1list1Elements = null;
			dStore1list2Elements = null;
			dStore1AppHome1Node = null;
			dStore1AppHome2Node = null;
			dStore1App1S1View = null;
			dStore1App1V1View = null;
			dStore1App1V7View = null;

		},
		"test initial view": function () {
			var d = this.async(10000);

			var appStartedDef1 = main(json.parse(stripComments(dStore1config1)), dStore1Container1);
			appStartedDef1.then(function (app) {
				// we are ready to test
				testApp = app;


				// Here dStore1App1Home1View should be displayed

				//	dStore1App1P1View = testApp.getViewFromViewId("P1");
				//	dStore1App1S1View = testApp.getViewFromViewId("P1_S1");
				//	dStore1App1V1View = testApp.getViewFromViewId("P1_S1_V1");

				// check that init has been called on these views
				//	assert.isTrue(dStore1App1P1View.initialized, "dStore1App1P1View.initialized should be true");
				//	assert.isTrue(dStore1App1S1View.initialized, "dStore1App1S1View.initialized should be true");
				//	assert.isTrue(dStore1App1V1View.initialized, "dStore1App1V1View.initialized should be true");

				dStore1Node1 = document.getElementById("dStore1AppdviewStack");

				// check the DOM state to see if we are in the expected state
				var dStore1List1 = document.getElementById("list1");
				dStore1AppHome1Node = document.getElementById("dStore1AppHome1");
				assert.isNotNull(dStore1List1, "root dStore1Node1 must be here");
				checkNodeVisibility(dStore1Node1, dStore1AppHome1Node);
				setTimeout(function () { // try timeout to list to become visible
					dStore1list1Elements = dStore1List1.getElementsByClassName("d-list-item-label");

					assert.deepEqual(dStore1list1Elements[0].innerHTML, "Selection 1",
						"element[0].innerHTML should be Selection 1");
					assert.deepEqual(dStore1list1Elements[1].innerHTML, "Selection 2",
						"element[1].innerHTML should be Selection 2");
					assert.deepEqual(dStore1list1Elements[2].innerHTML, "Selection 3",
						"element[2].innerHTML should be Selection 3");
					assert.deepEqual(dStore1list1Elements[3].innerHTML, "Selection 4",
						"element[3].innerHTML should be Selection 4");
					assert.deepEqual(dStore1list1Elements[4].innerHTML, "Selection 5",
						"element[4].innerHTML should be Selection 5");

					d.resolve();
				}, 10);
			});
			return d;
		},

		// Currently showing dStore1AppHome1 test transition to dStore1AppHome2
		"testApp.showOrHideViews('dStore1AppHome2')": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var dStore1List2 = document.getElementById("list2");
				var dStore1AppHome2 = document.getElementById("dStore1AppHome2");
				var header = dStore1AppHome2.getElementsByTagName("h2");
				assert.isNotNull(dStore1List2, "root dStore1Node1 must be here");
				setTimeout(function () { // try timeout to list to become visible
					dStore1list2Elements = dStore1List2.getElementsByClassName("d-list-item-label");

					dStore1AppHome2Node = document.getElementById("dStore1AppHome2");
					assert.isNotNull(dStore1List2, "root dStore1AppHome2Node must be here");
					checkNodeVisibility(dStore1Node1, dStore1AppHome2Node);

					//Test for selected label in header for List2
					var headerText = header[0].innerHTML;
					var indx = headerText.indexOf(dStore1list1Elements[0].innerHTML);
					assert.isFalse(indx === -1, "Should find label in header indx should not be -1");

					//Test for List2 data being correct.
					assert.deepEqual(dStore1list2Elements[0].innerHTML, "Selection 6",
						"element[0].innerHTML should be Selection 1");
					assert.deepEqual(dStore1list2Elements[1].innerHTML, "Selection 7",
						"element[1].innerHTML should be Selection 2");
					assert.deepEqual(dStore1list2Elements[2].innerHTML, "Selection 8",
						"element[2].innerHTML should be Selection 3");
					assert.deepEqual(dStore1list2Elements[3].innerHTML, "Selection 9",
						"element[3].innerHTML should be Selection 4");
					assert.deepEqual(dStore1list2Elements[4].innerHTML, "Selection 10",
						"element[4].innerHTML should be Selection 5");

					d.resolve();
				}, 10);
			});
			var label = dStore1list1Elements[0].innerHTML || "";
			testApp.showOrHideViews("dStore1AppHome2", {
				viewData: label,
				displayDeferred: displayDeferred
			});
		},


		// Currently showing dStore1AppHome2 test transition to dStore1AppHome1
		"testApp.showOrHideViews('dStore1AppHome1')": function () {
			var d = this.async(10000);
			var displayDeferred = new Deferred();
			displayDeferred.then(function (complete) {
				var dStore1List1 = document.getElementById("list2");
				var dStore1AppHome1 = document.getElementById("dStore1AppHome1");
				var header = dStore1AppHome1.getElementsByTagName("h2");
				assert.isNotNull(dStore1List1, "root dStore1Node1 must be here");
				setTimeout(function () { // try timeout to list to become visible
					dStore1list1Elements = dStore1List1.getElementsByClassName("d-list-item-label");

					dStore1AppHome1Node = document.getElementById("dStore1AppHome1");
					assert.isNotNull(dStore1List1, "root dStore1Node1 must be here");
					checkNodeVisibility(dStore1Node1, dStore1AppHome1Node);

					//Test for selected label in header for List0
					var headerText = header[0].innerHTML;
					var indx = headerText.indexOf(dStore1list2Elements[4].innerHTML);
					assert.isFalse(indx === -1, "Should find label in header indx should not be -1");

					//Test for List2 data being correct.
					assert.deepEqual(dStore1list2Elements[0].innerHTML, "Selection 6",
						"element[0].innerHTML should be Selection 1");
					assert.deepEqual(dStore1list2Elements[1].innerHTML, "Selection 7",
						"element[1].innerHTML should be Selection 2");
					assert.deepEqual(dStore1list2Elements[2].innerHTML, "Selection 8",
						"element[2].innerHTML should be Selection 3");
					assert.deepEqual(dStore1list2Elements[3].innerHTML, "Selection 9",
						"element[3].innerHTML should be Selection 4");
					assert.deepEqual(dStore1list2Elements[4].innerHTML, "Selection 10",
						"element[4].innerHTML should be Selection 5");

					d.resolve();
				}, 10);
			});
			var label = dStore1list2Elements[4].innerHTML || "";
			testApp.showOrHideViews("dStore1AppHome1", {
				viewData: label,
				displayDeferred: displayDeferred
			});
		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			dStore1Container1.parentNode.removeChild(dStore1Container1);
			testApp.unloadApp();
		}
	};

	registerSuite(dStore1Suite1);

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
