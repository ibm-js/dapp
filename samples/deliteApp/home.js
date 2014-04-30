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
		f: "app-view:",
		constructor: function (params) { // jshint unused:false
			//TODO: why is this not being hit?
			this.app.log(this.f, " in [" + this.viewName + "] constructor called for [" + this.id + "]");
		},
		init: function () {
			this.app.log(this.f, " in [" + this.viewName + "] init called for [" + this.id + "]");
			console.log("in home.js init called");
			this.attributes.testStringReplace = "yyyyed";
			this.domNode.currentStatus = this.domNode.currentStatus + "-init called";
			// I put the on click back in the home.html
			this.setuponclick = false;

			on(this.domNode.ownerDocument.getElementById("label1"), "click",
				//on(document.getElementById("label1"), "click",
				function () {
					console.log("in on click");
					//	deliteApp.displayView('detail2');
					var params = {
						viewData: "foo"
					};
					deliteApp.displayView('header+content,detail', params);
				}
			);

		},
		beforeActivate: function (previousView, viewData) {
			console.log("beforeActivate called for [" + this.viewName + "] with previousView.id =[" + (previousView ?
				previousView.id : "") + "] with viewData=", viewData);
			this.beforeActivateCallCount++;
			this.domNode.beforeActivateStatus = "called " + this.beforeActivateCallCount + " times";
			if (!this.setuponclick) {
				this.setuponclick = true;
				/*
				on(this.domNode.ownerDocument.getElementById("label1"), "click",
					//on(document.getElementById("label1"), "click",
					function () {
						//	deliteApp.displayView('detail2');
						var params = {
							viewData: "foo"
						};
						deliteApp.displayView('header+content,detail', params);
					}
				);
				*/
				self = this;
				on(this.domNode.ownerDocument.getElementById("label2"), "click",
					function () {
						self.domNode.ownerDocument.getElementById("content-view-stack").show('detail', {
							transition: "slide"
						});
					}
				);
			}
		},
		beforeDeactivate: function (nextView, viewData) {
			console.log("beforeDeactivate called for [" + this.viewName + "] with previousView.id =[" + (nextView ?
				nextView.id : "") + "]");
			this.beforeDeactivateCallCount++;
			this.domNode.beforeDeactivateStatus = "called " + this.beforeDeactivateCallCount + " times";
		},
		afterActivate: function (previousView, viewData) {
			console.log("afterActivate called for [" + this.viewName + "] with previousView.id =[" + (previousView ?
				previousView.id : "") + "] with viewData=", viewData);
			this.afterActivateCallCount++;
			this.domNode.afterActivateStatus = "called " + this.afterActivateCallCount + " times";
		},
		afterDeactivate: function (nextView, viewData) {
			console.log("afterDeactivate called for [" + this.viewName + "] with previousView.id =[" + (nextView ?
				nextView.id : "") + "]");
			this.afterDeactivateCallCount++;
			this.domNode.afterDeactivateStatus = "called " + this.afterDeactivateCallCount + " times";
		}
	};
});
