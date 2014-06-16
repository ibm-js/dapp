define([], function () {
	return {
		attributes: {
			name: ""
		},
		beforeActivateCallCount: 0,
		beforeDeactivateCallCount: 0,
		afterActivateCallCount: 0,
		afterDeactivateCallCount: 0,
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
			this.beforeActivateCallCount++;
		},
		beforeDeactivate: function () {
			this.beforeDeactivateCallCount++;
		},
		afterActivate: function () {
			this.afterActivateCallCount++;
		},
		afterDeactivate: function () {
			this.afterDeactivateCallCount++;
		},
		// for now destroy function is required or an error can occur during dapp-unload-app or dapp-unload-view
		destroy: function () {
			//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
		}
	};
});
