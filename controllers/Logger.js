define(
	["dcl/dcl", "dojo/on", "../Controller", "dojo/has"],
	function (dcl, on, Controller, has) {
		//var MODULE = "delite/Logger";

		return dcl(Controller, {
			constructor: function (app) {
				// summary:
				//		A custom logger to handle logging based upon config options for loggingList, logAll, and
				// 		logTimeStamp.  It will replace the app.log function with the one in this controller.
				//
				// app:
				//		dojox/app application instance.
				app.appLogging = app.appLogging || {};
				app.appLogging.loggingList = app.appLogging.loggingList || [];

				has.add("app-log-api", app.appLogging.logAll);
				has.add("app-log-partial", app.appLogging.loggingList.length > 0);

				if (app.appLogging.logAll || has("app-log-partial")) {
					app.log = function () {
						// summary:
						// If config is set to turn on app logging, then log msg to the console
						//
						// arguments:
						// the message to be logged,
						// all but the last argument will be treated as Strings and be concatenated together,
						// the last argument can be an object it will be added as an argument to the console.log
						var msg = "";
						if (app.appLogging.logTimeStamp) {
							msg = msg + new Date().getTime() + " ";
						}
						if (has("app-log-api") || app.appLogging.logAll) { // log all messages
							for (var i = 1; i < arguments.length - 1; i++) {
								msg = msg + arguments[i] + " ";
							}
							console.log(msg, arguments[arguments.length - 1]);
						} else if (has("app-log-partial")) { // only log specific things
							// if the 1st arg is in the loggingList log it
							if (app.appLogging.loggingList.indexOf(arguments[0]) > -1) {
								for (var j = 1; j < arguments.length - 1; j++) {
									msg = msg + arguments[j];
								}
								console.log(msg, arguments[arguments.length - 1]);
							}
						}
					};
				}
			}
		});
	});
