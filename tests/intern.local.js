// run grunt --help for help on how to run
define([
	"./intern"
], function (intern) {
	intern.useSauceConnect = false;
	//	maxConcurrency: 1
	intern.webdriver = {
		host: "localhost",
		port: 4444
	};

	intern.environments = [
		{ browserName: "safari" },
		{ browserName: "chrome" }
	//	{ browserName: "firefox" },
	//	{ browserName: "internet explorer", requireWindowFocus: "true" }
	];

	return intern;
});
