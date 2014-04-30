// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {

		init: function () {
			console.log(this.viewName + " init called.");
		},
		beforeActivate: function (previousView, viewData) {
			console.log("beforeActivate called for [" + this.viewName + "] with previousView.id =[" + (previousView ?
				previousView.id : "") + "] with viewData=", viewData);
		},
		beforeDeactivate: function (nextView, viewData) {
			console.log("beforeDeactivate called for [" + this.viewName + "] with previousView.id =[" + (nextView ?
				nextView.id : "") + "]");
		},
		afterActivate: function (previousView, viewData) {
			console.log("afterActivate called for [" + this.viewName + "] with previousView.id =[" + (previousView ?
				previousView.id : "") + "] with viewData=", viewData);
		},
		afterDeactivate: function (nextView, viewData) {
			console.log("afterDeactivate called for [" + this.viewName + "] with previousView.id =[" + (nextView ?
				nextView.id : "") + "]");
		}
	};
});
