define([], function () {
	return {
		name: "",
		_beforeActivateCallCount: 0,
		_beforeDeactivateCallCount: 0,
		_afterActivateCallCount: 0,
		_afterDeactivateCallCount: 0,
		tempName: "",
		init: function () {
			this.domNode.name = this.id;
		},
		beforeActivate: function () {
			this._beforeActivateCallCount++;
		},
		beforeDeactivate: function () {
			this._beforeDeactivateCallCount++;
		},
		afterActivate: function () {
			this._afterActivateCallCount++;
		},
		afterDeactivate: function () {
			this._afterDeactivateCallCount++;
		},
		// for now destroy function is required or an error can occur during dapp-unload-app or dapp-unload-view
		destroy: function () {
			//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
		}
	};
});
