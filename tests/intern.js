// run grunt --help for help on how to run
// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({
	// The port on which the instrumenting proxy will listen
	proxyPort: 9000,

	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		//{ browserName: "internet explorer", version: "11", platform: "Windows 8.1", requireWindowFocus: "true",
		//	name : "dapp"},
		//{ browserName: "internet explorer", version: "10", platform: "Windows 8", requireWindowFocus: "true",
		//	name : "dapp"},
		// { browserName: "internet explorer", version: "9", platform: "Windows 7" },
		//{ browserName: "firefox", version: "31", platform: [ /*"OS X 10.6", "Linux", */ "Windows 7" ],
		//	name : "dapp"},
		{ browserName: "chrome", version: "33", platform: [ /*"OS X 10.6", "Linux", */ "Windows 7" ],
			name : "dapp"},
		{ browserName: "safari", version: "7", platform: [ "OS X 10.9" ], name : "dapp"},

		// Mobile
		{ browserName: "iphone 7.1 simulator", platform: "OS X 10.9", version: "7.1", deviceName: "iPhone",
			app: "safari", device: "iPhone Simulator", name: "dapp" }

	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 3,

	// Whether or not to start Sauce Connect before running tests
	useSauceConnect: true,

	// Connection information for the remote WebDriver service. If using Sauce Labs, keep your username and password
	// in the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables unless you are sure you will NEVER be
	// publishing this configuration file somewhere
	webdriver: {
		host: "localhost",
		port: 4444
	},
	loader: {
		baseUrl: typeof window !== "undefined" ? "../../.." : "..",
		paths: {
			//"jquery": "jquery/jquery",
			//"jquery.mobile": "jquery-mobile/js/jquery.mobile-1.4.2",
			"jquery": "https://code.jquery.com/jquery-2.1.1.min",
			"jquery.mobile": "http://code.jquery.com/mobile/1.4.3/jquery.mobile-1.4.3",
			//"jquery.mobile": "http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2",
			"jquery.mobile.css": "http://code.jquery.com/mobile/1.4.3/"
		},
		shim: {
			'jquery.mobile': { deps: ['jquery'] }
		},
		waitSeconds: 15
	},

	useLoader: {
		"host-node": "requirejs",
		"host-browser": "../../../requirejs/require.js"
	},

	// Non-functional test suite(s) to run in each browser
	suites: ["dapp/tests/unit/all"],

	// Functional test suite(s) to run in each browser once non-functional tests are completed
	functionalSuites: ["dapp/tests/functional/all"],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^(requirejs.*|dcl|dojo|dpointer|dstore|decor|jquery|jquery.mobile|delite|deliteful\/|dapp\/tests|.*themes|.*transitions)/
});
