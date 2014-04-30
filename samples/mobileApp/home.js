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

		init: function () {
			console.log("in home.js init called");
			this.attributes.testStringReplace = "yyyyed";
			this.domNode.currentStatus = this.domNode.currentStatus + "-init called";
			// I put the on click back in the home.html
			on(this.domNode.ownerDocument.getElementById("label1"), "click",
				function () {
					console.log("in on click");
					//	deliteApp.displayView('detail2');
					deliteApp.displayView("content,detail");
				}
			);
		},
		beforeActivate: function (previousView, viewData) {
			console.log("in home.js beforeActivate called");
			this.beforeActivateCallCount++;
			this.domNode.beforeActivateStatus = "called " + this.beforeActivateCallCount + " times";
		},
		beforeDeActivate: function (previousView, viewData) {
			console.log("in home.js beforeDeactivate called previousView=", previousView);
			this.beforeDeactivateCallCount++;
			this.domNode.beforeDeactivateStatus = "called " + this.beforeDeactivateCallCount + " times";
		},
		afterActivate: function (previousView) {
			console.log("in home.js afterActivate called");
			this.afterActivateCallCount++;
			this.domNode.afterActivateStatus = "called " + this.afterActivateCallCount + " times";
		},
		afterDeactivate: function (previousView) {
			console.log("in home.js afterDeactivate called previousView=", previousView);
			this.afterDeactivateCallCount++;
			this.domNode.afterDeactivateStatus = "called " + this.afterDeactivateCallCount + " times";
		}
	};
});
