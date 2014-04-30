// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		attributes: {
			name: ""
		},
		constructor: function (params) { // jshint unused:false
			//TODO: why is this not being hit?
			this.app.log("app-view:", " in [" + this.viewName + "] constructor called for [" + this.id + "]");
			var tempName = "";
			if (this.id === "simple2App1Home2") {
				setTimeout(function () {
					for (var i = 0; i < 500; i++) {
						tempName = this.id + i;
					}
				}, 500);
			}
		},
		init: function () {
			this.domNode.name = this.id;
			if (this.id === "simple2App1Home2") {
				setTimeout(function () {
					for (var i = 0; i < 500; i++) {
						tempName = this.id + i;
					}
				}, 500);
				//	simple2App.displayView('simp1Home3', {});
			}
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
