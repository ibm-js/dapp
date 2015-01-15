// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"decor/sniff",
	"dapp/Application",
	"lie/dist/lie",
	"dojo/when",
	"requirejs-text/text!dapp/tests/unit/dstoreMemory/app.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack",
	"deliteful/list/List",
	"dstore/Memory"
], function (registerSuite, assert, has, Application, Promise, when, dstoreMemoryconfig1) {
	// -------------------------------------------------------------------------------------- //

	// for dstoreMemorySuite1 transition test
	var dstoreMemoryContainer1,
		testApp,
		dstoreMemorylist1Elements,
		dstoreMemorylist2Elements,
		dstoreMemoryAppHome1Node,
		dstoreMemoryAppHome2Node,
		dstoreMemoryNode1;

	var dstoreMemoryHtmlContent1 =
		"<d-view-stack id='dstoreMemoryAppdviewStack' style='width: 100%; height: 100%;'>" +
		"</d-view-stack>";


	window.dstoreMemoryApp = {};
	window.dstoreMemoryApp.list1Data = {
		identifier: "id",
		'items': []
	};
	for (var i = 1; i < 6; i++) {
		window.dstoreMemoryApp.list1Data.items.push({
			label: "Selection " + i,
			id: i
		});
	}


	window.dstoreMemoryApp.list2Data = {
		identifier: "id",
		'items': []
	};
	for (i = 6; i < 11; i++) {
		window.dstoreMemoryApp.list2Data.items.push({
			label: "Selection " + i,
			id: i
		});
	}

	var dstoreMemorySuite1 = {
		name: "dstoreMemorySuite1: test app transitions",
		setup: function () {
			dstoreMemoryContainer1 = document.createElement("div");
			document.body.appendChild(dstoreMemoryContainer1);
			dstoreMemoryContainer1.innerHTML = dstoreMemoryHtmlContent1;
		},
		beforeEach: function () {
			return new Promise(function (resolve) {
				setTimeout(resolve, 50);
			});
		},
		"test initial view": function () {
			this.timeout = 20000;
			if (has("ie") === 10) {
				this.skip("Skipping dstoreMemory tests on IE10");
			}
			return new Application(JSON.parse(stripComments(dstoreMemoryconfig1)), dstoreMemoryContainer1)
				.then(function (appx) {
					// we are ready to test
					testApp = appx;

					// Here dstoreMemoryApp1Home1View should be displayed

					dstoreMemoryNode1 = document.getElementById("dstoreMemoryAppdviewStack");

					// check the DOM state to see if we are in the expected state
					var dstoreMemoryList1 = document.getElementById("list1");
					dstoreMemoryList1.deliver();
					dstoreMemoryAppHome1Node = document.getElementById("dstoreMemoryAppHome1");
					assert.isNotNull(dstoreMemoryList1, "root dstoreMemoryNode1 must be here");
					checkNodeVisibility(dstoreMemoryNode1, dstoreMemoryAppHome1Node);
					dstoreMemorylist1Elements = dstoreMemoryList1.getElementsByClassName("d-list-item-label");

					assert.strictEqual(dstoreMemorylist1Elements[0].innerHTML, "Selection 1",
						"element[0].innerHTML should be Selection 1");
					assert.strictEqual(dstoreMemorylist1Elements[1].innerHTML, "Selection 2",
						"element[1].innerHTML should be Selection 2");
					assert.strictEqual(dstoreMemorylist1Elements[2].innerHTML, "Selection 3",
						"element[2].innerHTML should be Selection 3");
					assert.strictEqual(dstoreMemorylist1Elements[3].innerHTML, "Selection 4",
						"element[3].innerHTML should be Selection 4");
					assert.strictEqual(dstoreMemorylist1Elements[4].innerHTML, "Selection 5",
						"element[4].innerHTML should be Selection 5");
				});
		},

		// Currently showing dstoreMemoryAppHome1 test transition to dstoreMemoryAppHome2
		"testApp.showOrHideViews('dstoreMemoryAppHome2')": function () {
			this.timeout = 20000;

			if (has("ie") === 10) {
				this.skip("Skipping dstoreMemory tests on IE10");
			}
			var label = dstoreMemorylist1Elements[0].innerHTML || "";
			return testApp.showOrHideViews("dstoreMemoryAppHome2", {
				viewData: {
					label: label
				}
			}).then(function () {
				var dstoreMemoryList2 = document.getElementById("list2");
				var dstoreMemoryAppHome2 = document.getElementById("dstoreMemoryAppHome2");
				var header = dstoreMemoryAppHome2.getElementsByTagName("h2");
				assert.isNotNull(dstoreMemoryList2, "root dstoreMemoryNode1 must be here");
				dstoreMemorylist2Elements = dstoreMemoryList2.getElementsByClassName("d-list-item-label");

				dstoreMemoryAppHome2Node = document.getElementById("dstoreMemoryAppHome2");
				assert.isNotNull(dstoreMemoryList2, "root dstoreMemoryAppHome2Node must be here");
				checkNodeVisibility(dstoreMemoryNode1, dstoreMemoryAppHome2Node);

				//Test for selected label in header for List2
				var headerText = header[0].innerHTML;
				var indx = headerText.indexOf(dstoreMemorylist1Elements[0].innerHTML);
				assert.notStrictEqual(indx, -1, "Should find label in header indx should not be -1");

				//Test for List2 data being correct.
				assert.strictEqual(dstoreMemorylist2Elements[0].innerHTML, "Selection 6",
					"element[0].innerHTML should be Selection 1");
				assert.strictEqual(dstoreMemorylist2Elements[1].innerHTML, "Selection 7",
					"element[1].innerHTML should be Selection 2");
				assert.strictEqual(dstoreMemorylist2Elements[2].innerHTML, "Selection 8",
					"element[2].innerHTML should be Selection 3");
				assert.strictEqual(dstoreMemorylist2Elements[3].innerHTML, "Selection 9",
					"element[3].innerHTML should be Selection 4");
				assert.strictEqual(dstoreMemorylist2Elements[4].innerHTML, "Selection 10",
					"element[4].innerHTML should be Selection 5");
			});
		},

		// Currently showing dstoreMemoryAppHome2 test transition to dstoreMemoryAppHome1
		"testApp.showOrHideViews('dstoreMemoryAppHome1')": function () {
			this.timeout = 20000;
			if (has("ie") === 10) {
				this.skip("Skipping dstoreMemory tests on IE10");
			}
			var label = dstoreMemorylist2Elements[4].innerHTML || "";
			return testApp.showOrHideViews("dstoreMemoryAppHome1", {
				viewData: {
					label: label
				}
			}).then(function () {
				var dstoreMemoryList1 = document.getElementById("list2");
				dstoreMemoryList1.deliver();
				var dstoreMemoryAppHome1 = document.getElementById("dstoreMemoryAppHome1");
				var header = dstoreMemoryAppHome1.getElementsByTagName("h2");
				assert.isNotNull(dstoreMemoryList1, "root dstoreMemoryNode1 must be here");
				dstoreMemorylist1Elements = dstoreMemoryList1.getElementsByClassName("d-list-item-label");

				dstoreMemoryAppHome1Node = document.getElementById("dstoreMemoryAppHome1");
				assert.isNotNull(dstoreMemoryList1, "root dstoreMemoryNode1 must be here");
				checkNodeVisibility(dstoreMemoryNode1, dstoreMemoryAppHome1Node);

				//Test for selected label in header for List0
				var headerText = header[0].innerHTML;
				var indx = headerText.indexOf(dstoreMemorylist2Elements[4].innerHTML);
				assert.notStrictEqual(indx, -1, "Should find label in header indx should not be -1");

				//Test for List2 data being correct.
				assert.strictEqual(dstoreMemorylist2Elements[0].innerHTML, "Selection 6",
					"element[0].innerHTML should be Selection 1");
				assert.strictEqual(dstoreMemorylist2Elements[1].innerHTML, "Selection 7",
					"element[1].innerHTML should be Selection 2");
				assert.strictEqual(dstoreMemorylist2Elements[2].innerHTML, "Selection 8",
					"element[2].innerHTML should be Selection 3");
				assert.strictEqual(dstoreMemorylist2Elements[3].innerHTML, "Selection 9",
					"element[3].innerHTML should be Selection 4");
				assert.strictEqual(dstoreMemorylist2Elements[4].innerHTML, "Selection 10",
					"element[4].innerHTML should be Selection 5");
			});
		},

		teardown: function () {
			// call unloadApp to cleanup and end the test
			dstoreMemoryContainer1.parentNode.removeChild(dstoreMemoryContainer1);
			testApp.unloadApp();
		}
	};

	registerSuite(dstoreMemorySuite1);

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

	// strip out single line comments from the json config
	function stripComments(jsonData) {
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		return jsonData;
	}

});
