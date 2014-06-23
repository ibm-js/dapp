// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		name: "",
		constructor: function (params) { // jshint unused:false
			//TODO: why is this not being hit?
			//console.log("app-view:", " in [" + this.viewName + "] constructor called for [" + this.id + "]");
			var tempName = "";
			if (this.id === "transitionVisibilityApp1Home2") {
				setTimeout(function () {
					for (var i = 0; i < 500; i++) {
						tempName = this.id + i;
					}
				}, 500);
			}
		},
		init: function () {
			this.domNode.name = this.id;
			if (this.id === "transitionVisibilityApp1Home2") {
				setTimeout(function () {
					for (var i = 0; i < 500; i++) {
						tempName = this.id + i;
					}
				}, 500);
				//	transitionVisibilityApp.showOrHideViews('simp1Home3', {});
			}
		},
		beforeActivate: function (previousView, viewData) {
			//console.log("app-view:", "beforeActivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this._beforeActivateCallCount++;
		},
		beforeDeactivate: function (nextView, viewData) {
			//console.log("app-view:", "beforeDeactivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(nextView ? nextView.id : "") + "]");
			this._beforeDeactivateCallCount++;
		},
		afterActivate: function (previousView, viewData) {
			//console.log("app-view:", "afterActivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this._afterActivateCallCount++;
		},
		afterDeactivate: function (nextView, viewData) {
			//console.log("app-view:", "afterDeactivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(nextView ? nextView.id : "") + "]");
			this._afterDeactivateCallCount++;
		},
		destroy: function () {
			//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
		}
	};
});
