/** @module dapp/controllers/delite/Init */
define(["require", "dcl/dcl", "../InitBase",
		"jquery", "jquery.mobile"
	],
	function (require, dcl, InitBase, $) {
		/**
		 * An Init controller for a dapp application using delite.
		 *
		 * @class module:dapp/controllers/jqm/Init
		 * @augments module:dapp/controllers/InitBase
		 */
		return dcl(InitBase, {
			_initContainer: function () {
				// create the delite main container or use it if already available in the HTML of the app
				if (this.app.containerSelector == null) {
					// the user has not notified us of a widget to use as the parent
					// jqm will add one if there is not already one, find it
					this.app.containerNode = $("div:jqmData(role='page')").parentNode;
					this._displayInit();
				} else {
					//var pageParentNode = $("div:jqmData(role='page')").parentNode;
					var pageNodes = $("div[data-role='page']");
					var pageParentNode = pageNodes[0].parentNode;
					this.app.containerNode = this.app.domNode.querySelector(this.app.containerSelector);
					if (pageParentNode !== this.app.containerNode) {
						console.warn("invalid containerSelector, it does not have a child with a data-role of page, " +
							"so it will not be used. containerSelector = " + this.app.containerSelector);
						this.app.containerNode = pageParentNode;
					}
					this._displayInit();
				}
			}
		});
	});
