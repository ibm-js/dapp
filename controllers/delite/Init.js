/** @module dapp/controllers/delite/Init */
define(["require", "dcl/dcl", "../InitBase"],
	function (require, dcl, InitBase) {
		/**
		 * An Init controller for a dapp application using delite.
		 *
		 * @class module:dapp/controllers/delite/Init
		 * @augments module:dapp/controllers/InitBase
		 */
		return dcl(InitBase, {
			_initContainer: function () {
				// create the delite main container or use it if already available in the HTML of the app
				if (this.app.containerSelector == null) {
					if (this.app.domNode.children[0] == null) {
						// the user has not notified us of a widget to use as the parent
						// build one
						var self = this;
						require(["deliteful/ViewStack"], function (ViewStack) {
							var containerNode = self.app.containerNode = new ViewStack();
							containerNode.style.width = "100%";
							containerNode.style.height = "100%";
							containerNode.style.display = "block";
							self.app.domNode.appendChild(containerNode);
							containerNode.startup();
							self._displayInit();
						});
					} else {
						this.app.containerNode = this.app.domNode.children[0];
						this._displayInit();
					}
				} else {
					this.app.containerNode = this.app.domNode.querySelector(this.app.containerSelector);
					this._displayInit();
				}
			}
		});
	});
