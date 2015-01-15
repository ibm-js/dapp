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
require(["dapp/Application", "requirejs-text/text!./app.json", "jquery", "jquery.mobile"],
	function (Application, config, $) {
		var jsonData = config;
		jsonData = jsonData.replace(/\/\*.*?\*\//g, "");
		jsonData = jsonData.replace(/\/\/.*/g, "");
		//new Application(JSON.parse(jsonData));
		new Application(JSON.parse(jsonData)).then(function (app) {
			console.log("promise resolved for new App [" + app.id + "] it should be started and default views shown");
		});

		// don't forget to trigger JQM manually
		if ($.mobile.autoInitializePage === false) {
			$.mobile.initializePage();
		}
	});
