// Test file to run infrastructure tests from a browser
// Run using http://localhost/dapp/node_modules/intern/client.html?config=tests/intern.browser

define([
	"./intern"
], function (intern) {

	intern.loader = {
		paths: {
			"lie": "lie",

			"jquery.mobile": "https://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4",
			"jquery.mobile.css": "http://code.jquery.com/mobile/1.4.4/",

			// this works without the JQM tests
			//"jquery": "jquery"

			// this works with the JQM tests
			"jquery": "jquery/dist/jquery.min"
				//	"jquery": "https://code.jquery.com/jquery-2.1.1.min"

		},
		shim: {
			"jquery.mobile": {
				deps: ["jquery"]
			}
		},
		baseUrl: "../../.."
	};

	return intern;
});
