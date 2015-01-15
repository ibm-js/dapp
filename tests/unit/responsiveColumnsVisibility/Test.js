// jshint quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"dapp/Application",
	"delite/register",
	"lie/dist/lie",
	"dojo/when",
	"requirejs-text/text!dapp/tests/unit/responsiveColumnsVisibility/config.json",
	"deliteful/LinearLayout",
	"deliteful/ResponsiveColumns",
	"deliteful/ViewStack"
], function (registerSuite, assert, Application, register, Promise, when, responsiveColumnsVisibilityconfig) {
	// -------------------------------------------------------------------------------------- //
	// for responsiveColumnsVisibilitySuite
	var responsiveColumnsVisibilityContainer1,
		rctestApp,
		rcvsNode,
		responsiveColumnsVisibilityNode1;
	/*
	 */
	function testLayout(element, targetSize) {
		var elementStyle = function (key) {
			if (key === "flex") {
				var flexAttrs = ["-webkit-box-flex", "-moz-box-flex", "-webkit-flex", "-ms-flex", "flex"];
				for (var i = 0; i < flexAttrs.length; i++) {
					var v = window.getComputedStyle(this.node).getPropertyValue(flexAttrs[i]);
					if (v) {
						return v.charAt(0);
					}
				}
				return "0";
			}

			return window.getComputedStyle(this.node).getPropertyValue(key);
		}.bind({
			node: element
		});
		if (targetSize === "hidden") {
			assert.strictEqual(elementStyle("display"), "none");
		} else if (targetSize === "fill") {
			assert.strictEqual(elementStyle("flex"), "1");
			assert.notStrictEqual(elementStyle("display"), "none");
		} else if (targetSize.indexOf("px") !== -1) {
			assert.strictEqual(elementStyle("width"), targetSize);
			assert.notStrictEqual(elementStyle("flex"), "1");
			assert.notStrictEqual(elementStyle("display"), "none");
		} else if (targetSize.indexOf("%") !== -1) {
			var w = parseInt(elementStyle("width").replace("px", ""), 10);
			targetSize = parseInt(targetSize.replace("%", ""), 10);
			assert.isTrue(Math.abs(w - (window.innerWidth * targetSize / 100)) < 3,
				"Wrong percent size"); // 3px tolerance
			assert.notStrictEqual(elementStyle("flex"), "1");
			assert.notStrictEqual(elementStyle("display"), "none");
		}
	}

	var leftLayout, centerLayout, rightLayout, rc;
	var responsiveColumnsVisibilityHtmlContent1 =
		"<d-responsive-columns id='rc' style='position: absolute; width: 100%; height: 100%'>" +
		"<div id='leftLayout'>" +
		"<d-linear-layout id='rcleft' style='position: absolute; width: 100%; height: 100%;'></d-linear-layout></div>" +
		"<div id='centerLayout'>" +
		"<d-linear-layout style='position: absolute; width: 100%; height: 100%'>" +
		"<d-view-stack id='vs' class='fill'></d-view-stack></d-linear-layout></div>" +
		"<div id='rightLayout'>" +
		"<d-view-stack id='rcright' style='position: absolute; width: 100%; height: 100%;'></d-view-stack></div>" +
		"</d-responsive-columns>";

	var responsiveColumnsVisibilitySuite = {
		name: "responsiveColumnsVisibilitySuite dapp responsiveColumnsVisibility: test app transitions",
		setup: function () {
			document.body.innerHTML = responsiveColumnsVisibilityHtmlContent1;
			register.parse();
			// set the initial breakpoints on the responsiveColumns widget, so all are visible
			rc = document.getElementById("rc");
			//var iw = window.innerWidth; // use window.innerWidth to check the window size
			// force Desktop layout (assume iw > 100)
			rc.breakpoints = "{'phone': '100px', 'tablet': '100px', 'desktop': '99999px'}";
			leftLayout = document.getElementById("leftLayout");
			centerLayout = document.getElementById("centerLayout");
			rightLayout = document.getElementById("rightLayout");
			leftLayout.setAttribute("layout", "{'phone': 'hidden', 'tablet': '182px', 'desktop': '20%'}");
			centerLayout.setAttribute("layout", "{'phone': 'fill', 'tablet': 'fill', 'desktop': 'fill'}");
			rightLayout.setAttribute("layout", "{'phone': 'hidden', 'tablet': 'hidden', 'desktop': '20%'}");
			rc.notifyCurrentValue("breakpoints");
			responsiveColumnsVisibilityNode1 = document.getElementById("responsiveColumnsVisibilityAppdviewStack");
		},
		beforeEach: function () {
			return new Promise(function (resolve) {
				setTimeout(resolve, 50);
			});
		},
		"Desktop layout test initial views": function () {
			this.timeout = 10000;

			return when(new Application(JSON.parse(stripComments(responsiveColumnsVisibilityconfig)),
				responsiveColumnsVisibilityContainer1).then(function (app) {
				// we are ready to test
				console.log("in responsiveColumnsVisibility tests app loaded. " + app.id);
				rctestApp = app;

				rcvsNode = document.getElementById("vs");
				var testId = "rcaaa";
				var testNode = document.getElementById(testId);
				assert.isNotNull(testNode, testId + " must be here");
				assert.isNotNull(rcvsNode, "rcvsNode must be here");
				testLayout(leftLayout, '20%');
				testLayout(centerLayout, 'fill');
				testLayout(rightLayout, '20%');
			}));
		},

		"Desktop Layout click slide BBB ": function () {
			this.timeout = 10000;
			return when(setupOnOncePromise(rctestApp, function () {
				var item = document.getElementById("showrcbbb");
				item.click();
			}).then(function (evt) {
				checkTransitionDetails(evt, "rcbbb", "slide", false, rcvsNode);
				testLayout(leftLayout, '20%');
				testLayout(centerLayout, 'fill');
				testLayout(rightLayout, '20%');
			}));
		},
		"Tablet layout test rcaaa": function () {
			this.timeout = 10000;
			return when(setupOnOncePromise(rctestApp, function () {
				var item = document.getElementById("showrcaaa");
				// force Tablet layout
				rc.breakpoints = "{'phone': '100px', 'tablet': '99000px', 'desktop': '99999px'}";
				item.click();
			}).then(function (evt) {
				// we are ready to test
				rcvsNode = document.getElementById("vs");
				var testId = "rcaaa";
				var testNode = document.getElementById(testId);
				assert.isNotNull(testNode, testId + " must be here");
				assert.isNotNull(rcvsNode, "rcvsNode must be here");
				checkTransitionDetails(evt, "rcaaa", "slide", false, rcvsNode);
				testLayout(leftLayout, '182px');
				testLayout(centerLayout, 'fill');
				testLayout(rightLayout, 'hidden');
			}));
		},

		"Tablet Layout click slide BBB": function () {
			this.timeout = 10000;
			return when(setupOnOncePromise(rctestApp, function () {
				var item = document.getElementById("showrcbbb");
				item.click();
			}).then(function (evt) {
				checkTransitionDetails(evt, "rcbbb", "slide", false, rcvsNode);
				testLayout(leftLayout, '182px');
				testLayout(centerLayout, 'fill');
				testLayout(rightLayout, 'hidden');
			}));
		},
		"Phone layout test rcaaa": function () {
			this.timeout = 10000;
			return when(setupOnOncePromise(rctestApp, function () {
				var item = document.getElementById("showrcaaa");
				// force Phone layout
				rc.breakpoints = "{'phone': '98000px', 'tablet': '99000px', 'desktop': '99999px'}";
				item.click();
			}).then(function (evt) {
				// we are ready to test
				rcvsNode = document.getElementById("vs");
				var testId = "rcaaa";
				var testNode = document.getElementById(testId);
				assert.isNotNull(testNode, testId + " must be here");
				assert.isNotNull(rcvsNode, "rcvsNode must be here");
				checkTransitionDetails(evt, "rcaaa", "slide", false, rcvsNode);
				testLayout(leftLayout, 'hidden');
				testLayout(centerLayout, 'fill');
				testLayout(rightLayout, 'hidden');
			}));
		},

		"Phone Layout click slide CCC": function () {
			this.timeout = 10000;
			return when(setupOnOncePromise(rctestApp, function () {
				var item = document.getElementById("centershowrcccc");
				item.click();
			}).then(function (evt) {
				checkTransitionDetails(evt, "rcccc", "slide", false, rcvsNode);
				testLayout(leftLayout, 'hidden');
				testLayout(centerLayout, 'fill');
				testLayout(rightLayout, 'hidden');
			}));
		},

		teardown: function () {
			// call unloadApp to cleanup and end the test
			document.body.removeChild(document.body.firstChild);
			rctestApp.unloadApp();
		}
	};

	registerSuite(responsiveColumnsVisibilitySuite);

	function checkTransitionDetails(evt, testId, transType, rev, parentNode) {
		var testNode = document.getElementById(testId);
		assert.isNotNull(testNode, "Node not found with Id = " + testId);
		checkNodeVisibility(parentNode, testNode);
		assert.strictEqual(evt.transition, transType, "evt.transition should be " + transType);
		assert.isTrue(evt.dest.indexOf(testId) >= 0, "evt.dest should include " + testId);
		assert.isTrue(evt.reverse ? rev : true, "evt.reverse=" + evt.reverse + " it should be " + rev);
	}

	function setupOnOncePromise(testApp, stmts) {
		return new Promise(function (resolve) {
			stmts();
			var signal = testApp.on("dapp-finished-transition", function (evt) {
				resolve(evt);
				signal.unadvise();
			});
		}.bind(this));
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
