// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		attributes: {
			testStringReplace: "xAZZZZed",
			"beforeActivateStatus": "none",
			"beforeDeactivateStatus": "none",
			"afterActivateStatus": "none",
			"afterDeactivateStatus": "none",
			"currentStatus": "test"
		},
		currentStatus: "testxxx",
		beforeActivateCallCount: 0,
		beforeDeactivateCallCount: 0,
		afterActivateCallCount: 0,
		afterDeactivateCallCount: 0,
		constructor: function (params) { // jshint unused:false
			console.log("dapp/View:constructor called for " + this.id);
		},
		MODULE: "aaa",
		init: function () {
			this.app.log(this.MODULE, this.viewName + " init called");
		},
		beforeActivate: function (previousView, viewData) {
			console.log(this.viewName + " beforeActivate called previousView.id =[" + (previousView ?
				previousView.id : "") + "]");
		},
		beforeDeactivate: function (nextView, viewData) {
			console.log(this.viewName + " beforeDeactivate called nextView.id= [" + (nextView ?
				nextView.id : "") + "]");
		},
		afterActivate: function (previousView) {
			console.log(this.viewName + " afterActivate called previousView.id =[" + (previousView ?
				previousView.id : "") + "]");
		},
		afterDeactivate: function (nextView) {
			console.log(this.viewName + " afterDeactivate called nextView.id= [" + (nextView ?
				nextView.id : "") + "]");
		}
	};
});
