// run grunt --help for help on how to run
define([
	"./intern"
], function (intern) {
	intern.tunnel = "NullTunnel";
	intern.tunnelOptions = {
		hostname: "localhost",
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
