// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on"], function (dom, on) {
	return {
		init: function () {
			console.log("in detail.js init called");
			on(this.domNode.ownerDocument.getElementById("detaillabel2"), "click",
				function () {
					console.log("in on click");
					deliteApp.displayView("content,home");
				}
			);
		},
		beforeActivate: function (previousView, viewData) {
			if (previousView && previousView.id) {
				dom.byId("label").innerHTML = " - from - " + previousView.id + (viewData ? ("-" + viewData) : "");
			}
		}
	};
});
