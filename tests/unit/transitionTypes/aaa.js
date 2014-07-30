// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		MODULE: "aaa",
		beforeActivate: function (previousView, viewData) {
			this.app.emit("vs-selection-changed", "aaa");
		}
	};
});
