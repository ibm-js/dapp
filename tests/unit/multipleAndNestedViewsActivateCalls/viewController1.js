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
			// attempt to slow down the creation of this widget to see if Home3 would be placed before it
			if (this.id === "multipleAndNestedViewsActivateCallsApp1Home2") {
				setTimeout(function () {
					for (var i = 0; i < 500; i++) {
						this.tempName = this.id + i;
					}
				}, 500);
			}
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
