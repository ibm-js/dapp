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
			this.domNode.name = this.id;
			// attempt to slow down the creation of this widget to see if Home3 would be placed before it
		},
		beforeActivate: function (previousView, viewData) {
			this.app.log("app-view:", "beforeActivate called for [" + this.viewName + "] with previousView.id =[" +
				(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this.beforeActivateCallCount++;
			if (this.id === "right1") {
				this.domNode.style.backgroundColor = "darkgoldenrod";
			} else {
				this.domNode.style.backgroundColor = "orange";
			}
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
			this.app.emit("afterActivateCalled", {
				view: this
			});
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
