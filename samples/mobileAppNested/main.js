// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on"], function (dom, on) {
	return {
		init: function () {
			console.log("in main.js init called");
		},
		beforeActivate: function (previousView, viewData) {
			console.log("in main.js beforeActivate called");
		}
	};
});
