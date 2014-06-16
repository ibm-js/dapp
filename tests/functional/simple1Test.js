// jshint unused:false, undef:false, quotmark:false
define([
	"intern!object",
	"intern/chai!assert",
	"require"
], function (registerSuite, assert, require) {
	var WAIT_TIMEOUT_MS = 18000;

	registerSuite({
		name: "dapp simple1 test",
		"setup": function () {
			var remote = this.remote;
			return remote
				.get(require.toUrl("./simple1/index.html"))
				.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
				.then(function () {
					console.log("in ready");
					return true;
				});
		},

		"test defaultView sel111 initialized and active": function () {
			return this.remote
				.execute("return simple1App1.children.header1.initialized")
				.then(function (value) {
					//console.log("value simple1App1.children.header1.initialized is = " + value);
					assert.isTrue(value, "simple1App1.children.header1.initialized should be true");
				})
				.end()
				.execute("return simple1App1.children.header1._active")
				.then(function (value) {
					assert.isTrue(value);
				})
				.end()
				.execute("return simple1App1.children.center1.initialized")
				.then(function (value) {
					//console.log("value simple1App1.children.center1.initialized is = " + value);
					assert.isTrue(value, "simple1App1.children.center1.initialized should be true");
				})
				.end()
				.execute("return simple1App1.children.center1._active")
				.then(function (value) {
					assert.isTrue(value);
				})
				.end()
				.execute("return simple1App1.children.footer1.initialized")
				.then(function (value) {
					//console.log("value simple1App1.children.footer1.initialized is = " + value);
					assert.isTrue(value, "simple1App1.children.footer1.initialized should be true");
				})
				.end()
				.execute("return simple1App1.children.footer1._active")
				.then(function (value) {
					assert.isTrue(value);
				})
				.end()
				.elementById("footer1")
				.isDisplayed(function (err, displayed) {
					assert.isTrue(displayed, "footer1 should be visible");
				})
				.end();
		},

		"test defaultView sel111 activate calls": function () {
			return this.remote
				.execute("return simple1App1.children.header1.beforeActivateCallCount")
				.then(function (value) {
					assert.equal(1, value);
				})
				.end()
				.execute("return simple1App1.children.header1.domNode.textContent")
				.then(function (value) {
					assert(/header1/.test(value), "textContent (" + value + ") contains header1");
				})
				.end()
				.execute("return simple1App1.children.center1.domNode.textContent")
				.then(function (value) {
					assert(/center1/.test(value), "textContent (" + value + ") contains center1");
				})
				.end()
				.execute("return simple1App1.children.footer1.domNode.textContent")
				.then(function (value) {
					assert(/footer1/.test(value), "textContent (" + value + ") contains footer1");
				})
				.end();
		},

		"test defaultView sel111 textContent calls": function () {
			return this.remote
				.execute("return simple1App1.children.header1.domNode.textContent")
				.then(function (value) {
					assert(/header1/.test(value), "textContent (" + value + ") contains header1");
				})
				.end()
				.execute("return simple1App1.children.center1.domNode.textContent")
				.then(function (value) {
					assert(/center1/.test(value), "textContent (" + value + ") contains center1");
				})
				.end()
				.execute("return simple1App1.children.footer1.domNode.textContent")
				.then(function (value) {
					assert(/footer1/.test(value), "textContent (" + value + ") contains footer1");
				})
				.end();
		},

		"test click sel222": function () {
			return this.remote
				.execute("return simple1App1.children.center1.domNode.getElementsByClassName('sel222')[0]")
				.click()
				.end()
				.wait(500)
				.execute("return simple1App1.children.header2.domNode.textContent")
				.then(function (value) {
					assert(/header2/.test(value), "textContent (" + value + ") contains header2");
				})
				.end()
				.execute("return simple1App1.children.center2.domNode.textContent")
				.then(function (value) {
					assert(/center2/.test(value), "textContent (" + value + ") contains center2");
				})
				.end()
				.execute("return simple1App1.children.footer2.domNode.textContent")
				.then(function (value) {
					assert(/footer2/.test(value), "textContent (" + value + ") contains footer2");
				})
				.end();
		},
		"test sel222 initialized and active": function () {
			return this.remote
				.execute("return simple1App1.children.header2.initialized")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.children.header2.initialized should be true");
				})
				.end()
				.execute("return simple1App1.children.header2._active")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.children.header2._active should be true");
				})
				.end()
				.execute("return simple1App1.children.center2.initialized")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.children.center2.initialized should be true");
				})
				.end()
				.execute("return simple1App1.children.center2._active")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.children.center2._active should be true");
				})
				.end()
				.execute("return simple1App1.children.footer2.initialized")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.children.footer2.initialized should be true");
				})
				.end()
				.execute("return simple1App1.children.footer2._active")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.children.footer2._active should be true");
				})
				.end();
		},

		"test sel222 active sel111 not active": function () {
			return this.remote
				.execute("return simple1App1.children.header1._active")
				.then(function (value) {
					assert.isFalse(value, "simple1App1.children.header1._active should be false");
				})
				.end()
				.execute("return simple1App1.children.center1._active")
				.then(function (value) {
					assert.isFalse(value, "simple1App1.children.center1._active should be false");
				})
				.end()
				.execute("return simple1App1.children.footer1._active")
				.then(function (value) {
					assert.isFalse(value, "simple1App1.children.footer1._active should be false");
				})
				.end();
		},

		"test sel222 visible sel111 not visible": function () {
			return this.remote
				.execute(function () {
					return {
						display: simple1App1.children.header1.domNode.style.display,
						visibility: simple1App1.children.header1.domNode.style.visibility
					};
				})
				.then(function (style) {
					assert.equal("none", style.display);
					assert.equal("hidden", style.visibility);
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.children.center1.domNode.style.display,
						visibility: simple1App1.children.center1.domNode.style.visibility
					};
				})
				.then(function (style) {
					assert.equal("none", style.display);
					assert.equal("hidden", style.visibility);
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.children.footer1.domNode.style.display,
						visibility: simple1App1.children.footer1.domNode.style.visibility
					};
				})
				.then(function (style) {
					assert.equal("none", style.display);
					assert.equal("hidden", style.visibility);
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.children.header2.domNode.style.display,
						visibility: simple1App1.children.header2.domNode.style.visibility
					};
				})
				.then(function (style) {
					assert.equal("", style.display);
					assert.equal("visible", style.visibility);
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.children.center2.domNode.style.display,
						visibility: simple1App1.children.center2.domNode.style.visibility
					};
				})
				.then(function (style) {
					assert.equal("", style.display);
					assert.equal("visible", style.visibility);
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.children.footer2.domNode.style.display,
						visibility: simple1App1.children.footer2.domNode.style.visibility
					};
				})
				.then(function (style) {
					assert.equal("", style.display);
					assert.equal("visible", style.visibility);
				})
				.end();
		},

		"test sel222 activate calls": function () {
			return this.remote
				.execute("return simple1App1.children.header2.beforeActivateCallCount")
				.then(function (value) {
					assert.equal(1, value);
				})
				.end()
				.execute("return simple1App1.children.center2.domNode.textContent")
				.then(function (value) {
					assert(/center2/.test(value), "textContent (" + value + ") contains center2");
				})
				.end();
		},

		"test sel222 textContent calls": function () {
			return this.remote
				.execute("return simple1App1.children.header2.domNode.textContent")
				.then(function (value) {
					assert(/header2/.test(value), "textContent (" + value + ") contains header1");
				})
				.end()
				.execute("return simple1App1.children.center2.domNode.textContent")
				.then(function (value) {
					assert(/center2/.test(value), "textContent (" + value + ") contains center2");
				})
				.end()
				.execute("return simple1App1.children.footer2.domNode.textContent")
				.then(function (value) {
					assert(/footer2/.test(value), "textContent (" + value + ") contains footer2");
				})
				.end();
		},

		"test footer1": function () {
			return this.remote
				.execute("return simple1App1.children.footer1.domNode.textContent")
				.then(function (value) {
					assert(/footer1/.test(value), "textContent (" + value + ") contains footer1");
				})
				.end();
		}

	});
});
