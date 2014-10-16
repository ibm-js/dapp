// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	return {
		MODULE: "rcaaa",

		init: function () {
			document.getElementById("makeDesktopBut").onclick = function (evt) { //MouseEvent
				var rc = this.ownerDocument.getElementById("rc");
				var rc = this.ownerDocument.getElementById("rc");
				rc.breakpoints = "{'phone': '100px', 'tablet': '100px', 'desktop': '99999px'}";
				rc.notifyCurrentValue("breakpoints");
			}.bind(this);
		}
	};
});
