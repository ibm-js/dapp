define(["require", "dcl/dcl", "dojo/on", "dojo/Deferred", "dojo/_base/lang",
		"../../utils/hash", "../../Controller", "dojo/_base/declare"
	],
	function (require, dcl, on, Deferred, lang, hash, Controller, declare) {
		return dcl(Controller, {
			constructor: function () {
				this.events = {
					"dapp-init": this._initHandler,
					"dapp-setup-view-stores": this._createDataStore
				};
			},
			_initHandler: function () {
				this._createDataStore(this.app);
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

			_createDataStore: function (appOrView) {
				// summary:
				//		Create data store instance
				if (appOrView.stores) {
					//create stores in the configuration.
					for (var item in appOrView.stores) {
						if (item.charAt(0) !== "_") { //skip the private properties
							var type = appOrView.stores[item].type ? appOrView.stores[item].type : "dojo/store/Memory";
							var config = {};
							if (appOrView.stores[item].params) {
								dcl.mix(config, appOrView.stores[item].params);
							}
							// we assume the store is here through dependencies
							var StoreCtor;
							try {
								StoreCtor = require(type);
							} catch (e) {
								throw new Error(type + " must be listed in the dependencies");
							}
							if (config.data && typeof config.data === "string") {
								//get the object specified by string value of data property
								//cannot assign object literal or reference to data property
								//because json.ref will generate __parent to point to its parent
								//and will cause infinitive loop when creating StatefulModel.
								config.data = lang.getObject(config.data);
							}
							if (appOrView.stores[item].observable) {
								var observableCtor;
								try {
									observableCtor = require("dstore/Observable");
								} catch (e) {
									throw new Error("dstore/Observable must be listed in the dependencies");
								}
								// TODO: I was not able to get dstore observable working with dcl
								//appOrView.stores[item].store = observableCtor(new StoreCtor(config));
								//var MyStore = dcl([StoreCtor, observableCtor], {
								//	get: dcl.superCall(function (sup) {
								//		return function () {
								//			sup.call(this);
								//		}
								//	})
								var MyStore = declare([StoreCtor, observableCtor], {
									get: function () {
										// need to make sure that this.inherited still works with Observable
										return this.inherited(arguments);
									}
								});
								appOrView.stores[item].store = new MyStore(config);
							} else {
								appOrView.stores[item].store = new StoreCtor(config);
							}
							appOrView.loadedStores[item] = appOrView.stores[item].store;
						}
					}
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
						this.app.status = this.app.lifecycle.STARTED;
						this.app.appStartedDef.resolve(this.app); // resolve the deferred from new Application
					}.bind(this));
				}
			}
		});
	});
