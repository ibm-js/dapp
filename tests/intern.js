// run grunt --help for help on how to run
// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({
	// The port on which the instrumenting proxy will listen
	proxyPort: 9000,

	proxyUrl: "http://127.0.0.1:9000/",

	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		// It seems that specifying version="" or leaving version unspecified
		// does not default to the latest version of the browser.

		// Mobile
		{ platformName: "iOS", platformVersion: "7.1", browserName: "safari", deviceName: "iPhone Simulator",
			"appium-version": "1.2.2", name: "dapp" },

		// Desktop.
		//{ browserName: "internet explorer", version: "11", platform: "Windows 8.1", name : "dapp" },
		//{ browserName: "internet explorer", version: "10", platform: "Windows 8", name : "dapp" },
		{ browserName: "firefox", version: "31", platform: [ /*"OS X 10.6", "Linux", */ "Windows 7" ],
			name : "dapp"},
		{ browserName: "chrome", version: "32", platform: [ /*"OS X 10.6", "Linux", */ "Windows 7" ],
			name : "dapp"},
		{ browserName: "safari", version: "7", platform: [ "OS X 10.9" ], name : "dapp"}

	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 3,

	// Whether or not to start Sauce Connect before running tests
	tunnel: "SauceLabsTunnel",

	// Maximum duration of a test, in milliseconds
	TEST_TIMEOUT: 300000, // 5 minutes

	// Maximum time to wait for someting (pollUntil, etc...)
	WAIT_TIMEOUT: 180000, // 3 minutes

	// Interval between two polling request, in milliseconds (for pollUntil)
	POLL_INTERVAL: 500, // 0.5 seconds

	loader: {
		baseUrl: typeof window !== "undefined" ? "../../.." : "..",
		paths: {
			"lie": "lie",

			"jquery.mobile": "https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4",
			"jquery.mobile.css": "http://code.jquery.com/mobile/1.4.4/",

			// this works without the JQM tests
		//	"jquery": "jquery"

			// this works with the JQM tests
			"jquery": "jquery/dist/jquery.min"
		//	"jquery": "https://code.jquery.com/jquery-2.1.1.min"
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
	excludeInstrumentation: /^(requirejs.*|dcl|dojo|dpointer|dstore|decor|lie|jquery|jquery.mobile|delite|deliteful\/|dapp\/tests|.*themes|.*transitions|.*node_modules)/
});
