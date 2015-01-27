// quotmark:false needed for the inline html
// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/Application",
	"dapp/utils/view",
	"dapp/utils/hash",
	"delite/register",
	"requirejs-dplugins/Promise!",
	"dojo/when",
	"requirejs-text/text!dapp/tests/unit/historyController/app1.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, viewUtils, hash, register,
	Promise, when, historyControllerconfig1) {
	// -------------------------------------------------------------------------------------- //
	// for historyControllerSuite1 transition test
	var historyControllerContainer1, historyControllerNode1;
	var historyControllerHtmlContent1 =
		'<div style="position: relative; height: 500px"> ' +
		'	<d-side-pane mode="push" position="start" id="hc1leftPane" style="background-color: lavender;">' +
		'</d-side-pane>' +
		'	<d-linear-layout style="width:100%; height: 100%">' +
		'		<d-view-stack id="hc1headerViewStack" style="width: 100%; height: 10%;"></d-view-stack>' +
		'		<d-linear-layout id="hc1centerLinearLayout" style="width:100%; height: 100%" vertical="false">' +
		'</d-linear-layout>' +
		'		<d-view-stack id="hc1footerViewStack" style="width: 100%; height: 10%;"></d-view-stack>' +
		'	</d-linear-layout>' +
		'<d-side-pane mode="push" position="end" id="hc1rightPane"  style="background-color: lightgoldenrodyellow;">' +
		'</d-side-pane>' +
		'</div>';

	var testApp = null;
	var hc1right1View = null;
	var hc1header1View = null;
	var hc1center1View = null;
	var hc1footer1View = null;
	var hc1left2View = null;
	var hc1leftParentView = null;

	var historyControllerSuite1 = {
		name: "historyControllerSuite1: test app transitions",
		setup: function () {

			historyControllerContainer1 = document.createElement("div");
			document.body.appendChild(historyControllerContainer1);
			historyControllerContainer1.innerHTML = historyControllerHtmlContent1;
			register.parse(historyControllerContainer1);
			historyControllerNode1 =
				document.getElementById("historyControllerApp1linearlayout");


		},
		beforeEach: function () {
			return new Promise(function (resolve) {
				setTimeout(resolve, 50);
			});
		},
		"historyController test initial view": function () {
			this.timeout = 20000;
			return when(new Application(JSON.parse(stripComments(historyControllerconfig1)),
				historyControllerContainer1).then(function (app) {
				// we are ready to test
				testApp = app;

				//verify these are showing "defaultView": "hc1header1+hc1centerParent+hc1center1+hc1right1+hc1footer1",

				hc1header1View = viewUtils.getViewFromViewId(testApp, "hc1header1");
				hc1center1View = viewUtils.getViewFromViewId(testApp, "hc1center1");
				hc1right1View = viewUtils.getViewFromViewId(testApp, "hc1right1");
				hc1footer1View = viewUtils.getViewFromViewId(testApp, "hc1footer1");
				checkActivateCallCount(hc1header1View, 1);
				var hc1header1content = hc1header1View.containerNode;
				assert.isNotNull(hc1header1content, "hc1header1content must be here");
				var hc1center1content = hc1header1View.containerNode;
				checkActivateCallCount(hc1center1View, 1);
				assert.isNotNull(hc1center1content, "hc1center1 must be here");
				checkNodeVisibile(hc1center1content);
				var hc1right1content = hc1right1View.containerNode;
				checkActivateCallCount(hc1right1View, 1);
				assert.isNotNull(hc1right1content, "hc1right1content must be here");
				checkNodeVisibile(hc1right1content);

				var hc1footer1content = hc1footer1View.containerNode;
				checkActivateCallCount(hc1footer1View, 1);
				assert.isNotNull(hc1footer1content, "hc1footer1content must be here");

				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#hc1header1+hc1centerParent+hc1center1+hc1right1+hc1footer1",
					" currentHash should be #hc1header1+hc1centerParent+hc1center1+hc1right1+hc1footer1");
			}));
		},
		// Currently showing hc1header1+hc1centerParent+hc1center1+hc1right1+hc1footer1 test
		// showOrHideViews('hc1center2'
		"show hc1center2 with testApp.showOrHideViews('hc1center2')": function () {
			this.timeout = 20000;
			return when(testApp.showOrHideViews('hc1center2')
				.then(function () {
					var hc1center2content = document.getElementById("hc1center2");
					var hc1center2View = viewUtils.getViewFromViewId(testApp, "hc1center2");
					checkNodeVisibile(hc1center2content);
					checkActivateCallCount(hc1center2View, 1, true);
					var currentHash = window.location.hash;
					assert.strictEqual(currentHash, "#hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1",
						" currentHash should be #hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1");
				}));
		},
		// Currently showing hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1 test
		// showOrHideViews('hc1center3' with viewParams for hclcenter3
		"show hc1center3 with testApp.showOrHideViews('hc1center3', viewParams for hclcenter3)": function () {
			this.timeout = 20000;
			var params = {
				"viewParams": {
					"views": {
						"hc1center3": {
							'pTestVal1': "value1"
						}
					}
				}
			};
			return when(testApp.showOrHideViews('hc1center3', params)
				.then(function () {
					var hc1center3content = document.getElementById("hc1center3");
					var hc1center3View = viewUtils.getViewFromViewId(testApp, "hc1center3");
					checkNodeVisibile(hc1center3content);
					checkActivateCallCount(hc1center3View, 1, true);
					var currentHash = window.location.hash;
					assert.strictEqual(currentHash,
						"#hc1header1+hc1centerParent+(hc1center3&pTestVal1=value1)+hc1right1+hc1footer1",
						" currentHash should include (hc1center3&pTestVal1=value1)+hc1right1+hc1footer1");
				}));
		},
		// Currently showing hc1header1+hc1centerParent+hc1center3+hc1right1+hc1footer1 test
		// history.back()
		"test history.back() to get back to hc1center2)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.back();
			}).then(function () {
				var hc1center2content = document.getElementById("hc1center2");
				var hc1center2View = viewUtils.getViewFromViewId(testApp, "hc1center2");
				checkNodeVisibile(hc1center2content);
				checkActivateCallCount(hc1center2View, 2, true);
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1",
					" currentHash should be #hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1");
			}));
		},
		// Currently showing hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1 test
		// history.back()
		"test history.back() to get back to hc1center1)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.back();
			}).then(function () {
				var hc1center1content = document.getElementById("hc1center1");
				var hc1center1View = viewUtils.getViewFromViewId(testApp, "hc1center1");
				//checkNodeVisibile(hc1center1content);
				assert.isTrue(hc1center1content.style.display !== "none", "hc1center1content should be visible");
				checkActivateCallCount(hc1center1View, 2, true);
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#hc1header1+hc1centerParent+hc1center1+hc1right1+hc1footer1",
					" currentHash should be #hc1header1+hc1centerParent+hc1center1+hc1right1+hc1footer1");
			}));
		},
		// Currently showing hc1header1+hc1centerParent+hc1center1+hc1right1+hc1footer1 test
		// history.forward()
		"test history.forward() to get to hc1center2)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.forward();
			}).then(function () {
				var hc1center2content = document.getElementById("hc1center2");
				var hc1center2View = viewUtils.getViewFromViewId(testApp, "hc1center2");
				checkNodeVisibile(hc1center2content);
				checkActivateCallCount(hc1center2View, 3, true);
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1",
					" currentHash should be #hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1");
			}));
		},
		// Currently showing hc1header1+hc1centerParent+hc1center2+hc1right1+hc1footer1 test
		// history.forward()
		"test history.forward() to get to hc1center3)": function () {
			this.timeout = 11000;
			return when(setupOnOncePromise(testApp, function () {
				history.forward();
			}).then(function () {
				var hc1center3content = document.getElementById("hc1center3");
				var hc1center3View = viewUtils.getViewFromViewId(testApp, "hc1center3");
				checkNodeVisibile(hc1center3content);
				checkActivateCallCount(hc1center3View, 2, true);
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash,
					"#hc1header1+hc1centerParent+(hc1center3&pTestVal1=value1)+hc1right1+hc1footer1",
					" currentHash should include (hc1center3&pTestVal1=value1)+hc1right1+hc1footer1");
			}));
		},
		// Currently showing hc1header1+hc1centerParent+hc1center3+hc1right1+hc1footer1 test
		// showOrHideViews('-hc1right1'
		"Hide hc1right1 with testApp.showOrHideViews('-hc1right1')": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				testApp.showOrHideViews('-hc1right1', {
					displayResolve: resolve
				});
			}).then(function () {
				var hc1rightPane = document.getElementById("hc1rightPane");
				assert.strictEqual(hc1rightPane.style.display, "none", "hc1rightPane.style.display should be none");
				checkActivateCallCount(hc1right1View, 5, true);
				checkDeactivateCallCount(hc1right1View, 5, true);
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1 test
		// history.back()
		"test history.back() to get back to hc1right1)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.back();
			}).then(function () {
				var hc1rightPane = document.getElementById("hc1rightPane");
				assert.notStrictEqual(hc1rightPane.style.display, "none",
					"hc1rightPane.style.display should not be none");
				checkActivateCallCount(hc1right1View, 6, true);
				checkDeactivateCallCount(hc1right1View, 5, true);
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash,
					"#hc1header1+hc1centerParent+(hc1center3&pTestVal1=value1)+hc1right1+hc1footer1",
					" currentHash should include (hc1center3&pTestVal1=value1)+hc1right1+hc1footer1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+(hc1center3&pTestVal1=value1)+hc1right1+hc1footer1 test
		// history.forward()
		"test history.forward() to hide hc1right1)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.forward();
			}).then(function () {
				var hc1rightPane = document.getElementById("hc1rightPane");
				assert.strictEqual(hc1rightPane.style.display, "none", "hc1rightPane.style.display should be none");
				checkActivateCallCount(hc1right1View, 6, true);
				checkDeactivateCallCount(hc1right1View, 6, true);
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#hc1header1+hc1centerParent+hc1center3+hc1footer1",
					" currentHash should be #hc1header1+hc1centerParent+hc1center3+hc1footer1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1 test
		// showOrHideViews('leftParent,left1'
		"show hc1left1 with testApp.showOrHideViews('hc1leftParent,hc1left1')": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				var viewParams = {
					displayResolve: resolve,
					"viewParams": {
						'pTestVal': "value1"
					}
				};
				testApp.showOrHideViews('hc1leftParent,hc1left1', viewParams);
			}).then(function () {
				var hc1left1content = document.getElementById("hc1leftParent_hc1left1");
				var hc1left1View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left1");
				checkNodeVisibile(hc1left1content);
				checkActivateCallCount(hc1left1View, 1, true);
				assert.strictEqual(hc1left1View.viewParams.pTestVal, "value1",
					" hc1left1View.viewParams.pTestVal should equal value1");
				//	assert.strictEqual(hc1leftParentView.viewParams.pTestVal, "value1",
				//		" hc1leftParentView.viewParams.pTestVal should equal value1");
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash,
					"#hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1&pTestVal=value1",
					" currentHash should have &pTestVal=value1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1&pTestVal=value1
		// test showOrHideViews('-hc1leftParent') when I used showOrHideViews('-hc1leftParent-hc1leftParent,left1') it
		// got a warning because hc1leftParent was not found as the parent of left1
		"Hide hc1left1 with testApp.showOrHideViews('-hc1leftParent')": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				testApp.showOrHideViews('-hc1leftParent', {
					displayResolve: resolve
				});
			}).then(function () {
				//var hc1rightPane = document.getElementById("hc1rightPane");
				var hc1left1content = document.getElementById("hc1leftPane");
				var hc1left1View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left1");
				assert.strictEqual(hc1left1content.style.display, "none",
					"hc1left1content.style.display should be none");
				checkActivateCallCount(hc1left1View, 1, true);
				checkDeactivateCallCount(hc1left1View, 0, true); // not deactivated because only parent was
			}));
		},
		// Currently showing hc1header1+hc1centerParent+hc1center1+hc1footer1 test
		// hc1rightPaneElem.show('hc1right2')
		"show hc1right2 with hc1rightPaneElem.show('hc1right2')": function () {
			this.timeout = 20000;
			var hc1rightPaneElem = document.getElementById("hc1rightPane");
			//Note: at one point calls to .show or .hide did not update the url hash unless the view has a +, - or ,
			//but that was changed so that the history controller could handle those cases too.
			return when(hc1rightPaneElem.show('hc1right2').then(function () {
				var hc1right2View = viewUtils.getViewFromViewId(testApp, "hc1right2");
				checkActivateCallCount(hc1right2View, 1);
				var hc1right2content = hc1right2View.containerNode;
				assert.isNotNull(hc1right2content, "hc1right2content must be here");
				checkNodeVisibile(hc1right2content);
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1right2 test
		// hc1rightPaneElem.hide('hc1right2')
		"hide hc1right2 with hc1rightPaneElem.hide('hc1right2')": function () {
			this.timeout = 20000;
			var hc1rightPaneElem = document.getElementById("hc1rightPane");
			return when(hc1rightPaneElem.hide('hc1right2').then(function () {
				var hc1right2View = viewUtils.getViewFromViewId(testApp, "hc1right2");
				checkDeactivateCallCount(hc1right2View, 1);
				var hc1right2content = hc1right2View.containerNode;
				assert.isNotNull(hc1right2content, "hc1right2content must be here");
				//	checkNodeVisibile(hc1right2content);
				assert.strictEqual(hc1right2View.style.display, "none", "hc1right2View.style.display should be none");
				assert.strictEqual(hc1rightPaneElem.style.display, "none",
					"hc1rightPaneElem.style.display should be none");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1 test
		// showOrHideViews('leftParent,left2'
		"show hc1left2 - testApp.showOrHideViews('hc1leftParent,hc1left2' with parent and child params)": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				var params = {
					displayResolve: resolve,
					"viewParams": {
						"views": {
							"hc1leftParent": {
								'pTestVal2': "parentVal2"
							},
							"hc1leftParent,hc1left2": {
								'pTestVal1': "value2",
								'pHideObjTest1': {
									"obj1": "value2"
								}
							}
						},
						'pTestVal': "value2",
						'pHideObjTest2': {
							"obj1": "value2"
						}

					}
				};
				testApp.showOrHideViews('hc1leftParent,hc1left2', params);
			}).then(function () {
				var hc1left2content = document.getElementById("hc1leftParent_hc1left2");
				hc1left2View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left2");
				hc1leftParentView = viewUtils.getViewFromViewId(testApp, "hc1leftParent");
				checkNodeVisibile(hc1left2content);
				checkActivateCallCount(hc1left2View, 1, true);
				assert.strictEqual(hc1left2View.viewParams.pTestVal, "value2",
					" hc1left2View.viewParams.pTestVal should equal value2");
				assert.strictEqual(hc1left2View.viewParams.pTestVal2, "parentVal2",
					" hc1left2View.viewParams.pTestVal2 should equal parentVal2 mixed in from parent view");
				assert.strictEqual(hc1leftParentView.viewParams.pTestVal2, "parentVal2",
					" hc1leftParentView.viewParams.pTestVal2 should equal parentVal2");
				var currentHash = window.location.hash;
				// var t is when the child view params come before the parent
				//var t = "#hc1header1+hc1centerParent+hc1center3+hc1footer1+((hc1leftParent&pTestVal2=parentVal2)," +
				//	"hc1left2&pTestVal1=value2)&pTestVal=value2";
				var t2 = "#hc1header1+hc1centerParent+hc1center3+hc1footer1+(hc1leftParent&pTestVal2=parentVal2)," +
					"(hc1left2&pTestVal1=value2)&pTestVal=value2";
				assert.strictEqual(currentHash, t2,
					" currentHash should have (hc1leftParent,hc1left2&pTestVal1=value2) and &pTestVal=value1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left2" test
		// showOrHideViews('leftParent,left1'
		"show hc1left1 with testApp.showOrHideViews('hc1leftParent,hc1left1' with hideUrlHash true)": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				var params = {
					displayResolve: resolve,
					"viewParams": {
						"views": {
							"hc1leftParent": {
								'pTestVal1': "parentVal1"
							},
							"hc1leftParent,hc1left1": {
								'pTestVal1': "value1"
							}
						},
						'pTestVal': "value1"

					}
				};
				testApp.hideUrlHash = true;
				testApp.showOrHideViews('hc1leftParent,hc1left1', params);
			}).then(function () {
				var hc1left1content = document.getElementById("hc1leftParent_hc1left1");
				var hc1left1View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left1");
				var hc1leftParentView = viewUtils.getViewFromViewId(testApp, "hc1leftParent");
				checkNodeVisibile(hc1left1content);
				checkActivateCallCount(hc1left1View, 2, true);
				assert.strictEqual(hc1left1View.viewParams.pTestVal, "value1",
					" hc1left1View.viewParams.pTestVal should equal value1");
				assert.strictEqual(hc1left1View.viewParams.pTestVal1, "value1",
					" hc1left1View.viewParams.pTestVal1 should equal value1 from the child !mixed from parent view");
				assert.strictEqual(hc1leftParentView.viewParams.pTestVal1, "parentVal1",
					" hc1leftParentView.viewParams.pTestVal1 should equal parentVal1");
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "",
					" currentHash should be empty");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1" test
		// history.back()
		"test history.back() to get back to hc1leftParent,hc1left2)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.back();
			}).then(function () {
				var hc1left2content = document.getElementById("hc1leftParent_hc1left2");
				//var hc1left2View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left2");
				//var hc1leftParentView = viewUtils.getViewFromViewId(testApp, "hc1leftParent");
				checkNodeVisibile(hc1left2content);
				checkActivateCallCount(hc1left2View, 2, true);
				assert.strictEqual(hc1left2View.viewParams.pTestVal, "value2",
					" hc1left2View.viewParams.pTestVal should equal value2");
				assert.strictEqual(hc1left2View.viewParams.pTestVal2, "parentVal2",
					" hc1left2View.viewParams.pTestVal2 should equal parentVal2 mixed in from parent view");
				assert.strictEqual(hc1leftParentView.viewParams.pTestVal2, "parentVal2",
					" hc1leftParentView.viewParams.pTestVal2 should equal parentVal2");
				var currentHash = window.location.hash;
				var t2 = "#hc1header1+hc1centerParent+hc1center3+hc1footer1+(hc1leftParent&pTestVal2=parentVal2)," +
					"(hc1left2&pTestVal1=value2)&pTestVal=value2";
				assert.strictEqual(currentHash, t2,
					" currentHash should have (hc1leftParent,hc1left2&pTestVal1=value2) and &pTestVal=value1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1" test
		// history.forward()
		"test history.forward() to get back to hc1leftParent,hc1left1 with parent and child params)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.forward();
			}).then(function () {
				var hc1left1content = document.getElementById("hc1leftParent_hc1left1");
				var hc1left1View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left1");
				var hc1leftParentView = viewUtils.getViewFromViewId(testApp, "hc1leftParent");
				checkNodeVisibile(hc1left1content);
				checkActivateCallCount(hc1left1View, 3, true);
				assert.strictEqual(hc1left1View.viewParams.pTestVal, "value1",
					" hc1left1View.viewParams.pTestVal should equal value1");
				assert.strictEqual(hc1left1View.viewParams.pTestVal1, "value1",
					" hc1left1View.viewParams.pTestVal1 should equal value1 from the child !mixed from parent view");
				assert.strictEqual(hc1leftParentView.viewParams.pTestVal1, "parentVal1",
					" hc1leftParentView.viewParams.pTestVal1 should equal parentVal1");
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "",
					" currentHash should be empty");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1" test
		// showOrHideViews('leftParent,left2' with viewData
		"show hc1left2 testApp.showOrHideViews('hc1leftParent,hc1left2' with parent and child viewData)": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				var params = {
					displayResolve: resolve,
					"viewData": {
						"views": {
							"hc1leftParent": {
								'pTestVal2': "parentVal2"
							},
							"hc1leftParent,hc1left2": {
								'pTestVal1': "value2"
							}
						},
						'pTestVal': "value2"
					}
				};
				testApp.hideUrlHash = false;
				testApp.showOrHideViews('hc1leftParent,hc1left2', params);
			}).then(function () {
				var hc1left2content = document.getElementById("hc1leftParent_hc1left2");
				//var hc1left2View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left2");
				//var hc1leftParentView = viewUtils.getViewFromViewId(testApp, "hc1leftParent");
				checkNodeVisibile(hc1left2content);
				checkActivateCallCount(hc1left2View, 3, true);
				assert.strictEqual(hc1left2View.viewData.pTestVal, "value2",
					" hc1left2View.viewData.pTestVal should equal value2");
				assert.strictEqual(hc1leftParentView.viewData.pTestVal2, "parentVal2",
					" hc1leftParentView.viewData.pTestVal2 should equal parentVal2");
				var currentHash = window.location.hash;
				var t2 = "#hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left2";
				assert.strictEqual(currentHash, t2,
					" currentHash should be #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left2");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left2" test
		// showOrHideViews('leftParent,left1'
		"show hc1left1 with testApp.showOrHideViews('hc1leftParent,hc1left1' with viewData)": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				var params = {
					displayResolve: resolve,
					"viewData": {
						"views": {
							"hc1leftParent": {
								'pTestVal1': "parentVal1"
							},
							"hc1leftParent,hc1left1": {
								'pTestVal1': "value1"
							}
						},
						'pTestVal': "value1"
					}
				};
				testApp.showOrHideViews('hc1leftParent,hc1left1', params);
			}).then(function () {
				var hc1left1content = document.getElementById("hc1leftParent_hc1left1");
				var hc1left1View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left1");
				var hc1leftParentView = viewUtils.getViewFromViewId(testApp, "hc1leftParent");
				checkNodeVisibile(hc1left1content);
				checkActivateCallCount(hc1left1View, 4, true);
				assert.strictEqual(hc1left1View.viewData.pTestVal, "value1",
					" hc1left1View.viewData.pTestVal should equal value1");
				assert.strictEqual(hc1leftParentView.viewData.pTestVal1, "parentVal1",
					" hc1leftParentView.viewData.pTestVal1 should equal parentVal1");
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash,
					"#hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1",
					" currentHash should be #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1" test
		// history.back()
		"test history.back() to get back to hc1leftParent,hc1left2 with viewData)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.back();
			}).then(function () {
				var hc1left2content = document.getElementById("hc1leftParent_hc1left2");
				//var hc1left2View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left2");
				//var hc1leftParentView = viewUtils.getViewFromViewId(testApp, "hc1leftParent");
				checkNodeVisibile(hc1left2content);
				checkActivateCallCount(hc1left2View, 4, true);
				assert.strictEqual(hc1left2View.viewData.pTestVal, "value2",
					" hc1left2View.viewData.pTestVal should equal value2");
				assert.strictEqual(hc1leftParentView.viewData.pTestVal2, "parentVal2",
					" hc1leftParentView.viewData.pTestVal2 should equal parentVal2");
				var currentHash = window.location.hash;
				var t2 = "#hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left2";
				assert.strictEqual(currentHash, t2,
					" currentHash should be #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left2");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1" test
		// history.forward()
		"test history.forward() to get back to hc1leftParent,hc1left1 with viewData)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.forward();
			}).then(function () {
				var hc1left1content = document.getElementById("hc1leftParent_hc1left1");
				var hc1left1View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left1");
				var hc1leftParentView = viewUtils.getViewFromViewId(testApp, "hc1leftParent");
				checkNodeVisibile(hc1left1content);
				checkActivateCallCount(hc1left1View, 5, true);
				assert.strictEqual(hc1left1View.viewData.pTestVal, "value1",
					" hc1left1View.viewData.pTestVal should equal value1");
				assert.strictEqual(hc1leftParentView.viewData.pTestVal1, "parentVal1",
					" hc1leftParentView.viewData.pTestVal1 should equal parentVal1");
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash,
					"#hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1",
					" currentHash should be #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1" test
		// showOrHideViews('leftParent,left2' with viewData
		"show hc1left2 with testApp.showOrHideViews('hc1leftParent,hc1left2' hash set)": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				var params = {
					hash: "testHash1",
					displayResolve: resolve
				};
				testApp.showOrHideViews('hc1leftParent,hc1left2', params);
			}).then(function () {
				var hc1left2content = document.getElementById("hc1leftParent_hc1left2");
				//var hc1left2View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left2");
				checkNodeVisibile(hc1left2content);
				checkActivateCallCount(hc1left2View, 5, true);
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#testHash1", " currentHash should be #testHash1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left2" test
		// showOrHideViews('leftParent,left1'
		"show hc1left1 with testApp.showOrHideViews('hc1leftParent,hc1left1' with hash set)": function () {
			this.timeout = 20000;
			return when(new Promise(function (resolve) {
				var params = {
					hash: "testHash2",
					displayResolve: resolve,
					"viewParams": {
						'pTestVal': "value2"
					}
				};
				testApp.showOrHideViews('hc1leftParent,hc1left1', params);
			}).then(function () {
				var hc1left1content = document.getElementById("hc1leftParent_hc1left1");
				var hc1left1View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left1");
				checkNodeVisibile(hc1left1content);
				checkActivateCallCount(hc1left1View, 6, true);
				assert.strictEqual(hc1left1View.viewParams.pTestVal, "value2",
					" hc1left1View.viewParams.pTestVal should equal value2");
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#testHash2&pTestVal=value2",
					" currentHash should be #testHash2&pTestVal=value2");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1" test
		// history.back()
		"test history.back() to get back to hc1leftParent,hc1left2 with hash set)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.back();
			}).then(function () {
				var hc1left2content = document.getElementById("hc1leftParent_hc1left2");
				//var hc1left2View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left2");
				checkNodeVisibile(hc1left2content);
				checkActivateCallCount(hc1left2View, 6, true);
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#testHash1", " currentHash should be #testHash1");
			}));
		},
		// Currently showing #hc1header1+hc1centerParent+hc1center3+hc1footer1+hc1leftParent,hc1left1" test
		// history.forward()
		"test history.forward() to get back to hc1leftParent,hc1left1 with hash set)": function () {
			this.timeout = 20000;
			return when(setupOnOncePromise(testApp, function () {
				history.forward();
			}).then(function () {
				var hc1left1content = document.getElementById("hc1leftParent_hc1left1");
				var hc1left1View = viewUtils.getViewFromViewId(testApp, "hc1leftParent_hc1left1");
				checkNodeVisibile(hc1left1content);
				checkActivateCallCount(hc1left1View, 7, true);
				assert.strictEqual(hc1left1View.viewParams.pTestVal, "value2",
					" hc1left1View.viewParams.pTestVal should equal value2");
				var currentHash = window.location.hash;
				assert.strictEqual(currentHash, "#testHash2&pTestVal=value2",
					" currentHash should be #testHash2&pTestVal=value2");
			}));
		},

		teardown: function () {
			// call unloadApp to cleanup and end the test
			historyControllerContainer1.parentNode.removeChild(
				historyControllerContainer1);
			testApp.unloadApp();
		}
	};

	registerSuite(historyControllerSuite1);

	function setupOnOncePromise(testApp, stmts) {
		return new Promise(function (resolve) {
			stmts();
			var signal = testApp.on("dapp-finished-transition", function (evt) {
				resolve(evt);
				signal.unadvise();
			});
		}.bind(this));
	}

	function checkNodeVisibile(target) {
		assert.isTrue(target.style.display !== "none", target.id + " should be visible, but it is not");
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
