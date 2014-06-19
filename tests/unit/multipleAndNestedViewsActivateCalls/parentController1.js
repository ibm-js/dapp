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
		destroy: function () {
			//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
		}
	};
});
