// jshint quotmark:false
define([], function () {
	return {
		name: "",
		_beforeActivateCallCount: 0,
		_beforeDeactivateCallCount: 0,
		_afterActivateCallCount: 0,
		_afterDeactivateCallCount: 0,
		beforeActivateStatus: "none",
		afterActivateStatus: "none",

		init: function () {
			this.name = this.id;
		},
		beforeActivate: function (previousView, viewData) {
			//console.log("app-view:", "beforeActivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
			this._beforeActivateCallCount++;
			this.beforeActivateStatus = "called " + this._beforeActivateCallCount + " times";
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
			this.afterActivateStatus = "called " + this._afterActivateCallCount + " times";
		},
		afterDeactivate: function ( /*nextView, viewData*/ ) {
			//console.log("app-view:", "afterDeactivate called for [" + this.viewName + "] with previousView.id =[" +
			//	(nextView ? nextView.id : "") + "]");
			this._afterDeactivateCallCount++;
		}
	};
});
