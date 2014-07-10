// jshint quotmark:false
define([], function () {
	return {
		name: "",
		_beforeActivateCallCount: 0,
		_beforeDeactivateCallCount: 0,
		_afterActivateCallCount: 0,
		_afterDeactivateCallCount: 0,
		init: function () {
			this.domNode.name = this.id;
		},
		beforeActivate: function (previousView, viewData) {
			//console.log("app-view:", "beforeActivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this._beforeActivateCallCount++;
			this.viewData = viewData;
		},
		beforeDeactivate: function ( /*nextView, viewData*/ ) {
			//console.log("app-view:", "beforeDeactivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(nextView ? nextView.id : "") + "]");
			this._beforeDeactivateCallCount++;
		},
		afterActivate: function ( /*previousView, viewData*/ ) {
			//console.log("app-view:", "afterActivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this._afterActivateCallCount++;
		},
		afterDeactivate: function ( /*nextView, viewData*/ ) {
			//console.log("app-view:", "afterDeactivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(nextView ? nextView.id : "") + "]");
			this._afterDeactivateCallCount++;
		},
		// for now destroy function is required or an error can occur during dapp-unload-app or dapp-unload-view
		destroy: function () {
			//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
		}
	};
});
