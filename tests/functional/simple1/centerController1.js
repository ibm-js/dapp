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
			//console.log("app-view:", " in [" + this.viewName + "] constructor called for [" + this.id + "]");
			var tempName = "";
			//if (this.id === "nested1App1Home2") {
			//	setTimeout(function () {
			//		for (var i = 0; i < 500; i++) {
			//			tempName = this.id + i;
			//		}
			//	}, 500);
			//}
		},
		init: function () {
			this.domNode.name = this.id;
			// attempt to slow down the creation of this widget to see if Home3 would be placed before it
			if (this.id === "nested1App1Home2") {
				//setTimeout(function () {
				//	for (var i = 0; i < 500; i++) {
				//		tempName = this.id + i;
				//	}
				//}, 500);
			}
		},
		beforeActivate: function (previousView, viewData) {
			//console.log("app-view:", "beforeActivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this.beforeActivateCallCount++;
			if (this.id === "center1") {
				this.domNode.style.backgroundColor = "cyan";
			} else {
				this.domNode.style.backgroundColor = "green";
			}
		},
		beforeDeactivate: function (nextView, viewData) {
			//console.log("app-view:", "beforeDeactivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(nextView ? nextView.id : "") + "]");
			this.beforeDeactivateCallCount++;
		},
		afterActivate: function (previousView, viewData) {
			//console.log("app-view:", "afterActivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this.afterActivateCallCount++;
			this.app.emit("afterActivateCalled", {
				view: this
			});
		},
		afterDeactivate: function (nextView, viewData) {
			//console.log("app-view:", "afterDeactivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(nextView ? nextView.id : "") + "]");
			this.afterDeactivateCallCount++;
		},
		destroy: function () {
			//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
		}
	};
});
