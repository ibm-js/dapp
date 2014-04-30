// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on"], function (dom, on) {
	return {
		attributes: {
			"viewIdPlusLi": this.id + "test"
		},
		MODULE: "detail",
		init: function () {
			console.log("in detail.js init called");
			//	on(this.domNode.ownerDocument.getElementById("detaillabel2"), "click",
			on(this.domNode.querySelectorAll(".detaillabel2")[0], "click",
				//	on(document.getElementById(this.viewIdPlusLi), "click",
				function () {
					console.log("in on click");
					deliteApp.displayView("content,home", {
						reverse: true
					});
				}
			);
		},
		beforeActivate: function (previousView, viewData) {
			console.log("beforeActivate called for [" + this.viewName + "] with previousView.id =[" + (previousView ?
				previousView.id : "") + "] with viewData=", viewData);
			if (previousView && previousView.id) {
				dom.byId("label").innerHTML = " - from view - " + previousView.id + (viewData ? ("- viewData - " +
					viewData) : "");
			}
		},
		beforeDeactivate: function (nextView, viewData) {
			console.log("beforeDeactivate called for [" + this.viewName + "] with previousView.id =[" + (nextView ?
				nextView.id : "") + "]");
		},
		afterActivate: function (previousView, viewData) {
			console.log("afterActivate called for [" + this.viewName + "] with previousView.id =[" + (previousView ?
				previousView.id : "") + "] with viewData=", viewData);
		},
		afterDeactivate: function (nextView, viewData) {
			console.log("afterDeactivate called for [" + this.viewName + "] with previousView.id =[" + (nextView ?
				nextView.id : "") + "]");
		}
	};
});
