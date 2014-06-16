define([], function () {
	return {
		attributes: {
			name: ""
		},
		beforeActivateCallCount: 0,
		beforeDeactivateCallCount: 0,
		afterActivateCallCount: 0,
		afterDeactivateCallCount: 0,
		init: function () {
			this.domNode.name = this.id;
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
		destroy: function () {
			//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
		}
	};
});
