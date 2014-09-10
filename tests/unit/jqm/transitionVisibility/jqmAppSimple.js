// jshint unused:false, undef:false, quotmark:false
require(["jquery"],
	function ($) {
		// this must be setup after jquery is loaded, but before jquery.mobile is loaded
		$(document).bind("mobileinit", function () {
			// if this is set false the app must call $.mobile.initializePage();
			$.mobile.autoInitializePage = false;

			// Prevents all anchor click handling
			$.mobile.linkBindingEnabled = false;

			// Disabling this will prevent jQuery Mobile from handling hash changes,
			// if enabled History controller should not be used.
			$.mobile.hashListeningEnabled = false;

			// keep all previously-visited pages in the DOM
			$.mobile.page.prototype.options.domCache = true;

			// the hash in the location bar should not be updated by JQM
			$.mobile.changePage.defaults.changeHash = false;
		});
	});
require(["dapp/Application", "dojo/json", "requirejs-text/text!./app.json", "dojo/sniff",
		"jquery", "jquery.mobile"
	],
	function (Application, json, config, has, $) {
		has.add("requirejs", window.requirejs);
		/* jshint nonew: false */
		var jsonData = config;
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		//new Application(JSON.parse(jsonData));
		var appDeferred = new Application(JSON.parse(jsonData));
		appDeferred.then(function (app) {
			console.log("deferred resolved for new App [" + app.id + "] it should be started and default views shown");
		});

		// don't forget to trigger JQM manually
		if ($.mobile.autoInitializePage === false) {
			$.mobile.initializePage();
		}
	});
