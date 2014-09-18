// jshint undef:false, quotmark:false
define(["intern",
	"intern!object",
	"intern/dojo/node!leadfoot/helpers/pollUntil",
	"intern/chai!assert",
	"require"
], function (intern, registerSuite, pollUntil, assert, require) {
	var PAGE = "./simple1/index.html";

	registerSuite({
		//		beforeEach: function () {
		//			var remote = this.remote;
		//			return remote
		//				.get(require.toUrl(PAGE))
		//				.then(pollUntil("return ('ready' in window && ready) ? true : null;", [],
		//						intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL));
		//		},
		name: "dapp simple1 test",
		"setup": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			console.log("# running test setup for dapp simple1 test this.remote.environmentType.browserName = " +
				this.remote.environmentType.browserName);
			return remote
				.get(require.toUrl(PAGE))
				.then(pollUntil("return ('ready' in window && ready) ? true : null;", [],
					intern.config.WAIT_TIMEOUT, intern.config.POLL_INTERVAL))
				.then(function () {
					console.log("in ready for first functional test");
					return true;
				});
		},

		"test defaultView sel111 initialized and active": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute("return simple1App1.childViews.header1.initialized;")
				//.findById("header1") // this did not work
				.then(function (value) {
					assert.isTrue(value, "header1.initialized should be true");
				})
				.end()
				.execute("return document.getElementById('header1')._active;")
				.then(function (value) {
					assert.isTrue(value);
				})
				.end()
				.execute("return simple1App1.childViews.center1.initialized;")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.childViews.center1.initialized should be true");
				})
				.end()
				.execute("return simple1App1.childViews.center1._active;")
				.then(function (value) {
					assert.isTrue(value);
				})
				.end()
				.execute("return simple1App1.childViews.footer1.initialized;")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.childViews.footer1.initialized should be true");
				})
				.end()
				.execute("return simple1App1.childViews.footer1._active;")
				.then(function (value) {
					assert.isTrue(value);
				})
				.end()
				.findById("footer1")
				.isDisplayed(function (err, displayed) {
					assert.isTrue(displayed, "footer1 should be visible");
				})
				.end();
		},

		"test defaultView sel111 activate calls": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute("return simple1App1.childViews.header1._beforeActivateCallCount;")
				.then(function (value) {
					assert.strictEqual(value, 1, "simple1App1.childViews.header1._beforeActivateCallCount should be 1");
				})
				.end()
				.execute("return simple1App1.childViews.header1.textContent;")
				.then(function (value) {
					assert(/header1/.test(value), "textContent (" + value + ") contains header1");
				})
				.end()
				.execute("return simple1App1.childViews.center1.textContent;")
				.then(function (value) {
					assert(/center1/.test(value), "textContent (" + value + ") contains center1");
				})
				.end()
				.execute("return simple1App1.childViews.footer1.textContent;")
				.then(function (value) {
					assert(/footer1/.test(value), "textContent (" + value + ") contains footer1");
				})
				.end();
		},

		"test defaultView sel111 textContent calls": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute("return simple1App1.childViews.header1.textContent;")
				.then(function (value) {
					assert(/header1/.test(value), "textContent (" + value + ") contains header1");
				})
				.end()
				.execute("return simple1App1.childViews.center1.textContent;")
				.then(function (value) {
					assert(/center1/.test(value), "textContent (" + value + ") contains center1");
				})
				.end()
				.execute("return simple1App1.childViews.footer1.textContent;")
				.then(function (value) {
					assert(/footer1/.test(value), "textContent (" + value + ") contains footer1");
				})
				.end();
		},

		"test click sel222": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.findByClassName("sel222")
				.click()
				.end()
				.sleep(500)
				.execute("return simple1App1.childViews.header2.textContent;")
				.then(function (value) {
					assert(/header2/.test(value), "textContent (" + value + ") contains header2");
				})
				.end()
				.execute("return simple1App1.childViews.center2.textContent;")
				.then(function (value) {
					assert(/center2/.test(value), "textContent (" + value + ") contains center2");
				})
				.end()
				.execute("return simple1App1.childViews.footer2.textContent;")
				.then(function (value) {
					assert(/footer2/.test(value), "textContent (" + value + ") contains footer2");
				})
				.end();
		},

		"test sel222 initialized and active": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute("return simple1App1.childViews.header2.initialized;")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.childViews.header2.initialized should be true");
				})
				.end()
				.execute("return simple1App1.childViews.header2._active;")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.childViews.header2._active should be true");
				})
				.end()
				.execute("return simple1App1.childViews.center2.initialized;")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.childViews.center2.initialized should be true");
				})
				.end()
				.execute("return simple1App1.childViews.center2._active;")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.childViews.center2._active should be true");
				})
				.end()
				.execute("return simple1App1.childViews.footer2.initialized;")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.childViews.footer2.initialized should be true");
				})
				.end()
				.execute("return simple1App1.childViews.footer2._active;")
				.then(function (value) {
					assert.isTrue(value, "simple1App1.childViews.footer2._active should be true");
				})
				.end();
		},

		"test sel222 active sel111 not active": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute("return simple1App1.childViews.header1._active;")
				.then(function (value) {
					assert.isFalse(value, "simple1App1.childViews.header1._active should be false");
				})
				.end()
				.execute("return simple1App1.childViews.center1._active;")
				.then(function (value) {
					assert.isFalse(value, "simple1App1.childViews.center1._active should be false");
				})
				.end()
				.execute("return simple1App1.childViews.footer1._active;")
				.then(function (value) {
					assert.isFalse(value, "simple1App1.childViews.footer1._active should be false");
				})
				.end();
		},

		"test sel222 visible sel111 not visible": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute(function () {
					return {
						display: simple1App1.childViews.header1.style.display,
						visibility: simple1App1.childViews.header1.style.visibility
					};
				})
				.then(function (style) {
					assert.strictEqual(style.display, "none", "style.display for header1 should be none");
					assert.strictEqual(style.visibility, "hidden", "style.visibility for header1 should be hidden");
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.childViews.center1.style.display,
						visibility: simple1App1.childViews.center1.style.visibility
					};
				})
				.then(function (style) {
					assert.strictEqual(style.display, "none", "style.display for center1 should be none");
					assert.strictEqual(style.visibility, "hidden", "style.visibility for center1 should be hidden");
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.childViews.footer1.style.display,
						visibility: simple1App1.childViews.footer1.style.visibility
					};
				})
				.then(function (style) {
					assert.strictEqual(style.display, "none", "style.display for footer1 should be none");
					assert.strictEqual(style.visibility, "hidden", "style.visibility for footer1 should be hidden");
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.childViews.header2.style.display,
						visibility: simple1App1.childViews.header2.style.visibility
					};
				})
				.then(function (style) {
					assert.strictEqual(style.display, "", "style.display for header2 should be blank");
					assert.strictEqual(style.visibility, "visible", "style.visibility for header2 should be visible");
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.childViews.center2.style.display,
						visibility: simple1App1.childViews.center2.style.visibility
					};
				})
				.then(function (style) {
					assert.strictEqual(style.display, "", "style.display for center2 should be blank");
					assert.strictEqual(style.visibility, "visible", "style.visibility for center2 should be visible");
				})
				.end()
				.execute(function () {
					return {
						display: simple1App1.childViews.footer2.style.display,
						visibility: simple1App1.childViews.footer2.style.visibility
					};
				})
				.then(function (style) {
					assert.strictEqual(style.display, "", "style.display for footer2 should be blank");
					assert.strictEqual(style.visibility, "visible", "style.visibility for footer2 should be visible");
				})
				.end();
		},

		"test sel222 activate calls": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute("return simple1App1.childViews.header2._beforeActivateCallCount;")
				.then(function (value) {
					assert.strictEqual(value, 1, "simple1App1.childViews.header2._beforeActivateCallCount should be 1");
				})
				.end()
				.execute("return simple1App1.childViews.center2.textContent;")
				.then(function (value) {
					assert(/center2/.test(value), "textContent (" + value + ") contains center2");
				})
				.end();
		},

		"test sel222 textContent calls": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			return remote
				.execute("return simple1App1.childViews.header2.textContent;")
				.then(function (value) {
					assert(/header2/.test(value), "textContent (" + value + ") contains header1");
				})
				.end()
				.execute("return simple1App1.childViews.center2.textContent;")
				.then(function (value) {
					assert(/center2/.test(value), "textContent (" + value + ") contains center2");
				})
				.end()
				.execute("return simple1App1.childViews.footer2.textContent;")
				.then(function (value) {
					assert(/footer2/.test(value), "textContent (" + value + ") contains footer2");
				})
				.end();
		},

		"test footer1": function () {
			this.timeout = intern.config.TEST_TIMEOUT;
			var remote = this.remote;
			console.log("# test footer1 last test");
			return remote
				.execute("return simple1App1.childViews.footer1.textContent;")
				.then(function (value) {
					assert(/footer1/.test(value), "textContent (" + value + ") contains footer1");
				})
				.end();
		}

	});
});
