// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	var resetSelection = function () {};
	return {
		aaasel: false,
		bbbsel: false,
		cccsel: false,
		dddsel: false,

		setSelection: function (sel) {
			this.domNode.aaasel = false;
			this.domNode.bbbsel = false;
			this.domNode.cccsel = false;
			this.domNode.dddsel = false;
			if (sel === "aaa") {
				this.domNode.aaasel = true;
			} else if (sel === "bbb") {
				this.domNode.bbbsel = true;
			} else if (sel === "ccc") {
				this.domNode.cccsel = true;
			} else if (sel === "ddd") {
				this.domNode.dddsel = true;
			}
		},

		init: function () {
			console.log("in footer.js init called");
			this.app.on("vs-selection-changed", function (selection) {
				console.log(" in vs-selection-changed selection=" + selection);
				this.setSelection(selection);
			}.bind(this));
		},
		beforeActivate: function (previousView, viewData) {
			console.log("in home.js beforeActivate called");
		},
		beforeDeactivate: function (previousView, viewData) {
			console.log("in home.js beforeDeactivate called previousView=", previousView);
		},
		afterActivate: function (previousView) {
			if (this.domNode.ownerDocument.getElementById("vs")) {
				var vsNode = this.domNode.ownerDocument.getElementById("vs");
				var sel = vsNode.selectedChildId;
				this.setSelection(sel);
			}
			console.log("in home.js afterActivate called");
		},
		afterDeactivate: function (previousView) {
			console.log("in home.js afterDeactivate called previousView=", previousView);
		}
	};
});
