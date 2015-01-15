// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		beforeActivate: function (previousView, viewData) {
			this.app.emit("test-vs-selection-changed", "ddd");
		}
	};
});
