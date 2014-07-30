// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		beforeActivate: function (previousView, viewData) {
			this.app.emit("vs-selection-changed", "ddd");
		}
	};
});
