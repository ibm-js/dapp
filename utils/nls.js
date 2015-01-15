define(["require", "lie/dist/lie"], function (require, Promise) {
	/* jshint unused: vars */
	return function ( /*Object*/ config) {
		// summary:
		//		nls is called to create to load the nls all for the app, or for a view.
		// config: Object
		//		The section of the config for this view or for the app.
		return new Promise(function (resolve) {
			var path = config.nls;
			if (path) {
				require(["requirejs-dplugins/i18n!" + path], function (nls) {
					resolve(nls);
				});
			} else {
				resolve({});
			}
		}.bind(this));
	};
});
