define(["require", "dcl/dcl", "dojo/on", "dojo/Deferred", "../../Controller"],
	function (require, dcl, on, Deferred, Controller) {
		return dcl(Controller, {
			constructor: function () {
				this.app.on("dapp-init", this._initHandler.bind(this));
			},
			_initHandler: function () {
				// we might want to parse first
				if (this.app.parseOnLoad) {
					var self = this;
					require(["delite/register"], function (register) {
						register.parse();
						self._initContainer();
					});
				} else {
					this._initContainer();
				}
			},
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
			},
			_displayInit: function () {
				// fire the event on the container to load the main view
				var displayDeferred = new Deferred();
				var self = this;
				// let's display default view
				on.emit(document, "dapp-display", {
					// TODO is that really defaultView a good name? Shouldn't it be defaultTarget or defaultView_s_?
					dest: this.app.defaultView,
					displayDeferred: displayDeferred,
					bubbles: true,
					cancelable: true
				});
				// TODO views in the hash MUST be handled by history controller?
				if (this.app) {
					displayDeferred.then(function () {
						self.app.status = self.app.lifecycle.STARTED;
						self.app.appStartedDef.resolve(self.app); // resolve the deferred from new Application
					});
				}
			}
		});
	});
