define(["require", "dojo/Deferred"], function (require, Deferred) {
	/* jshint unused: vars */
	return function (/*Object*/ config, /*Object*/ parent) {
		// summary:
		//		nsl is called to create to load the nls all for the app, or for a view.
		// config: Object
		//		The section of the config for this view or for the app.
		// parent: Object
		//		The parent of this view or the app itself, so that nls from the parent will be
		//		available to the view.
		var path = config.nls;
		if (path) {
			var nlsDef = new Deferred();
			require(["dojo/i18n!" + path], function (nls) {
				nlsDef.resolve(nls);
			});
			return nlsDef;
		} else {
			return false;
		}
	};
});
