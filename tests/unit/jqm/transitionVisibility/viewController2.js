// jshint quotmark:false
define([], function () {
	return {
		beforeActivate: function ( /*previousView, data*/ ) {
			console.log("in beforeActivate for [" + this.id + "]");
		},
		afterActivate: function ( /*previousView, data*/ ) {
			console.log("in afterActivate for [" + this.id + "]");
		},
		beforeDeactivate: function ( /*previousView, data*/ ) {
			console.log("in beforeDeactivate for [" + this.id + "]");
		},
		afterDeactivate: function ( /*previousView, data*/ ) {
			console.log("in afterDeactivate for [" + this.id + "]");
		}
	};
});
