// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/Application",
	"delite/register",
	"dojo/Deferred",
	"requirejs-text/text!dapp/tests/unit/transitionTypes/config.json",
	"deliteful/LinearLayout",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, register, Deferred, transitionTypesconfig) {
	// -------------------------------------------------------------------------------------- //
	// for transitionTypesSuite
	var transitionTypesContainer1,
		testApp,
		vsNode,
		transitionTypesNode1;
	/*
	 */
	var transitionTypesHtmlContent1 =
		'<d-linear-layout class=" width100 height100 page">' +
		'	<d-linear-layout id="headerll" class=" width100 pageHeader"></d-linear-layout>' +
		'	<d-view-stack id="vs" class="vs width100"></d-view-stack>' +
		'	<d-view-stack id="footerll" class="vs width100 pageFooter" style="height:356px; background-color:blue;">' +
		'	<div id="inline"> ' +
		'	<input id="nextFooter4" type="button" onclick="footerll.show(\'footer\')">Transition with .show(footer) ' +
		'<br> ' +
		'		<button id="slidevAAAil" is="d-button" onclick="vs.show(\'aaa\',{transition:\'slidev\'})">' +
		'SlideV AAA</button>' +
		'		<button id="revealBBBil" is="d-button" onclick="vs.show(\'bbb\',{transition:\'reveal\'})">' +
		'Reveal BBB</button>' +
		'		<button id="flipCCCil" is="d-button" onclick="vs.show(\'ccc\',{transition:\'flip\'})">' +
		'Flip CCC</button>' +
		'		<button id="covervDDDil" is="d-button" onclick="vs.show(\'ddd\',{transition:\'coverv\'})">' +
		'CoverV DDD</button>' +
		'	</div>	' +
		'	</d-view-stack>' +
		'</d-linear-layout>';

	var transitionTypesSuite = {
		name: "transitionTypesSuite dapp transitionTypes: test app transitions",
		setup: function () {

			transitionTypesContainer1 = document.createElement("div");
			document.body.appendChild(transitionTypesContainer1);
			transitionTypesContainer1.innerHTML = transitionTypesHtmlContent1;
			register.parse(transitionTypesContainer1);
			transitionTypesNode1 = document.getElementById("transitionTypesAppdviewStack");
		},
		"transitionTypesSuite dapp transitionTypes test initial layout": function () {
			this.timeout = 10000;

			var appStartedDef = new Application(JSON.parse(stripComments(transitionTypesconfig)),
				transitionTypesContainer1);
			return appStartedDef.then(function (app) {
				// we are ready to test
				console.log("in transitionType tests app loaded. " + app.id);
				testApp = app;

				vsNode = document.getElementById("vs");
				var testId = "aaa";
				var testNode = document.getElementById(testId);
				assert.isNotNull(testNode, testId + " must be here");
				assert.isNotNull(vsNode, "vsNode must be here");
				checkNodeVisibility(vsNode, testNode);
			});
		},

		"Click Slide BBB1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("slideBBB1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "bbb", "slide", false, button, vsNode);
			});
		},
		"Click SlideV CCC1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("slidevCCC1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ccc", "slidev", false, button, vsNode);
			});
		},
		"Click Reveal DDD1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("revealDDD1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ddd", "reveal", false, button, vsNode);
			});
		},
		"Click RevealV AAA1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("revealvAAA1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "aaa", "revealv", false, button, vsNode);
			});
		},
		"Click Flip BBB1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("flipBBB1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "bbb", "flip", false, button, vsNode);
			});
		},
		"Click Fade CCC1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("fadeCCC1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ccc", "fade", false, button, vsNode);
			});
		},
		"Click Cover DDD1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("coverDDD1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ddd", "cover", false, button, vsNode);
			});
		},
		"Click Coverv AAA1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("covervAAA1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "aaa", "coverv", false, button, vsNode);
			});
		},
		"Click Slide BBB1 again": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("slideBBB1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "bbb", "slide", false, button, vsNode);
			});
		},
		"history.back() to Coverv AAA1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("covervAAA1");
			history.back();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "aaa", "coverv", true, button, vsNode);
			});
		},
		"history.back() to Cover DDD1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("coverDDD1");
			history.back();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ddd", "cover", true, button, vsNode);
			});
		},
		"history.back() to Fade CCC1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("fadeCCC1");
			history.back();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ccc", "fade", true, button, vsNode);
			});
		},
		"history.back() to Flip BBB1": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("flipBBB1");
			history.back();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "bbb", "flip", true, button, vsNode);
			});
		},
		"Click nextFooter1 to show footerShow": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var pNode = document.getElementById("footerll");
			var button = document.getElementById("nextFooter1");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "footerShow", "slide", false, button, pNode);
				var revbutton = document.getElementById("rev2"); // set reverse true
				revbutton.click();
			});
		},
		"Click RevealV AAA2 with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("revealvAAA2");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "aaa", "revealv", true, button, vsNode);
			});
		},
		"Click Flip BBB2 with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("flipBBB2");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "bbb", "flip", true, button, vsNode);
			});
		},
		"Click Fade CCC2 with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("fadeCCC2");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ccc", "fade", true, button, vsNode);
			});
		},
		"Click Cover DDD2 with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("coverDDD2");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ddd", "cover", true, button, vsNode);
			});
		},
		"history.back() to Fade CCC2 with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("fadeCCC2");
			history.back();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ccc", "fade", false, button, vsNode);
			});
		},
		"history.back() to Flip BBB2 with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("flipBBB2");
			history.back();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "bbb", "flip", false, button, vsNode);
			});
		},
		"history.back() to RevealV AAA2 with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("revealvAAA2");
			history.back();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "aaa", "revealv", false, button, vsNode);
			});
		},
		"history.forward() to Flip BBB2 with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("flipBBB2");
			history.forward();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "bbb", "flip", true, button, vsNode);
			});
		},
		"Click nextFooter2 to show footer3": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var pNode = document.getElementById("footerll");
			var button = document.getElementById("nextFooter2");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "footer3", "slide", true, button, pNode);
			});
		},
		"Click nextFooter3 to show inline which is not a dapp view": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			var pNode = document.getElementById("footerll");
			var sig = pNode.on("delite-after-show", function () {
				var evt = {}; // setup dummy event for test since no dapp transition is done
				evt.transition = "slide";
				evt.reverse = false;
				evt.dest = "inline";
				displayDeferred.resolve(evt);
				sig.remove();
			});
			var button = document.getElementById("nextFooter3");
			button.click();
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "inline", "slide", false, button, pNode);
			});
		},
		//
		"Click slidevAAAil with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("slidevAAAil");
			button.click();
			button.disabled = true; // for test
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "aaa", "slidev", false, button, vsNode);
			});
		},
		"Click revealBBBil with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("revealBBBil");
			button.click();
			button.disabled = true; // for test
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "bbb", "reveal", false, button, vsNode);
			});
		},
		"Click flipCCCil with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("flipCCCil");
			button.click();
			button.disabled = true; // for test
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ccc", "flip", false, button, vsNode);
			});
		},
		"Click covervDDDil with vs.show": function () {
			this.timeout = 10000;
			var displayDeferred = new Deferred();
			setupOnOnce(testApp, displayDeferred);
			var button = document.getElementById("covervDDDil");
			button.click();
			button.disabled = true; // for test
			return displayDeferred.then(function (evt) {
				checkTransitionDetails(evt, "ddd", "coverv", false, button, vsNode);
			});
		},
		teardown: function () {
			// call unloadApp to cleanup and end the test
			transitionTypesContainer1.parentNode.removeChild(transitionTypesContainer1);
			testApp.unloadApp();
		}
	};

	registerSuite(transitionTypesSuite);

	function checkTransitionDetails(evt, testId, transType, rev, button, parentNode) {
		var testNode = document.getElementById(testId);
		assert.isNotNull(testNode, "Node not found with Id = " + testId);
		checkNodeVisibility(parentNode, testNode);
		assert.strictEqual(evt.transition, transType, "evt.transition should be " + transType);
		assert.isTrue(evt.dest.indexOf(testId) >= 0, "evt.dest should include " + testId);
		assert.isTrue(evt.reverse ? rev : true, "evt.reverse=" + evt.reverse + " it should be " + rev);
		if (parentNode === vsNode) {
			assert.isTrue(button.disabled, "button.disabled should be true for " + testId);
		}
	}

	function setupOnOnce(testApp, displayDeferred) {
		var signal = testApp.on("dapp-finished-transition", function (evt) {
			displayDeferred.resolve(evt);
			signal.unadvise();
		});
	}

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
