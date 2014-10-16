// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register"], function (dom, on, register) {
	var resetSelection = function () {};
	return {
		init: function () {
				document.getElementById("leftlist1").onclick = function (evt) { //MouseEvent
					this.app.showOrHideViews(evt.target.getAttribute("showid"),
						{transition:document.getElementById("transSelect1").value,
							reverse:document.getElementById("rev").checked
						})
				}.bind(this);
			document.getElementById("makeTabletBut").onclick = function (evt) { //MouseEvent
				var rc = this.ownerDocument.getElementById("rc");
				rc.breakpoints = "{'phone': '200px', 'tablet': '99000px', 'desktop': '99999px'}";
				rc.notifyCurrentValue("breakpoints");
				console.log("set tablet size to 1301px");
			}.bind(this);
			document.getElementById("makePhoneBut").onclick = function (evt) { //MouseEvent
				var rc = this.ownerDocument.getElementById("rc");
				rc.breakpoints = "{'phone': '98000px', 'tablet': '99000px', 'desktop': '99999px'}";
				rc.notifyCurrentValue("breakpoints");
				console.log("set phone and tablet size to 1301px");
			}.bind(this);
		}
	};
});
