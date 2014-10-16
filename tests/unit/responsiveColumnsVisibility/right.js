// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		beforeDeactivate: function (previousView, viewData) {
			//console.log("in home.js beforeDeactivate called previousView=", previousView);
		},
		afterDeactivate: function (previousView) {
			//console.log("in home.js afterDeactivate called previousView=", previousView);
		}
	};
});
