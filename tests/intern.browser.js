// Test file to run infrastructure tests from a browser
// Run using http://localhost/dapp/node_modules/intern/client.html?config=tests/intern.browser

define([
	"./intern"
], function (intern) {

	intern.loader = {
		paths: {
			//"jquery": "jquery/jquery",
			//"jquery.mobile": "jquery-mobile/js/jquery.mobile-1.4.2",
			"jquery": "https://code.jquery.com/jquery-2.1.1.min",
			"jquery.mobile": "http://code.jquery.com/mobile/1.4.3/jquery.mobile-1.4.3",
			//"jquery.mobile": "http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2",
			"jquery.mobile.css": "http://code.jquery.com/mobile/1.4.3/"

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
