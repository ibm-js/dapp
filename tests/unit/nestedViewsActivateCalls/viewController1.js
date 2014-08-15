// jshint quotmark:false
define([ /*"dojo/dom", "dojo/on", "delite/register", "dcl/dcl", "dapp/View"*/ ],
	function ( /*dom, on, register, dcl, View*/ ) {
		//	return dcl([View], {
		return {
			name: "",
			beforeActivateCallCount: 0,
			beforeDeactivateCallCount: 0,
			afterActivateCallCount: 0,
			afterDeactivateCallCount: 0,
			init: function () {
				this.domNode.name = this.id;
			},
			beforeActivate: function ( /*previousView, viewData*/ ) {
				//console.log("app-view:", "beforeActivate called for [" + this.viewName +
				//"] with previousView.id =[" + (previousView ? previousView.id : "") + "] with viewData=", viewData);
				this.beforeActivateCallCount++;
			},
			beforeDeactivate: function ( /*nextView, viewData*/ ) {
				//console.log("app-view:", "beforeDeactivate called for [" + this.viewName +
				//	"] with previousView.id =[" + (nextView ? nextView.id : "") + "]");
				this.beforeDeactivateCallCount++;
			},
			afterActivate: function ( /*previousView, viewData*/ ) {
				//console.log("app-view:", "afterActivate called for [" + this.viewName + "] with previousView.id =[" +
				//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
				this.afterActivateCallCount++;
			},
			afterDeactivate: function ( /*nextView, viewData*/ ) {
				//console.log("app-view:", "afterDeactivate called for [" + this.viewName +
				//	"] with previousView.id =[" + (nextView ? nextView.id : "") + "]");
				this.afterDeactivateCallCount++;
			},
			destroy: function () {
				//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
			}
		};
		//); // for dcl view attempt...
	});
