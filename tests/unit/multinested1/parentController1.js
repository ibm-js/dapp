// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		attributes: {
			name: ""
		},
		beforeActivateCallCount: 0,
		beforeDeactivateCallCount: 0,
		afterActivateCallCount: 0,
		afterDeactivateCallCount: 0,
		constructor: function (params) { // jshint unused:false
			//TODO: why is this not being hit?
			this.app.log("app-view:", " in [" + this.viewName + "] constructor called for [" + this.id + "]");
			var tempName = "";
		},
		init: function () {
			this.app.log("app-view:", "init called for [" + this.viewName + "]");
			this.domNode.name = this.id;
		},
		beforeActivate: function (previousView, viewData) {
			this.app.log("app-view:", "beforeActivate called for [" + this.viewName + "] with previousView.id =[" +
				(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this.beforeActivateCallCount++;
		},
		beforeDeactivate: function (nextView, viewData) {
			this.app.log("app-view:", "beforeDeactivate called for [" + this.viewName + "] with previousView.id =[" +
				(nextView ? nextView.id : "") + "]");
			this.beforeDeactivateCallCount++;
		},
		afterActivate: function (previousView, viewData) {
			this.app.log("app-view:", "afterActivate called for [" + this.viewName + "] with previousView.id =[" +
				(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this.afterActivateCallCount++;
		},
		afterDeactivate: function (nextView, viewData) {
			this.app.log("app-view:", "afterDeactivate called for [" + this.viewName + "] with previousView.id =[" +
				(nextView ? nextView.id : "") + "]");
			this.afterDeactivateCallCount++;
		},
		destroy: function () {
			this.app.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
		}
	};
});
