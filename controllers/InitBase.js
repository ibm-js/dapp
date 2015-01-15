/** @module dapp/controllers/delite/Init */
define(["require", "dcl/dcl", "lie/dist/lie", "../Controller", "dojo/_base/declare"],
	function (require, dcl, Promise, Controller, declare) {
		/**
		 * An InitBase controller for a dapp application.
		 *
		 * @class module:dapp/controllers/delite/Init
		 * @augments module:dapp/Controller
		 */
		/**
		 * Get a property from a dot-separated string, such as "A.B.C".
		 */
		function getObject(name) {
			try {
				return name.split(".").reduce(function (context, part) {
					return context[part];
				}, this); // "this" is the global object (i.e. window on browsers)
			} catch (e) {
				// Return undefined to indicate that object doesn't exist.
			}
		}

		return dcl(Controller, {
			constructor: function () {
				this.events = {
					"dapp-init": this._initHandler.bind(this),
					"dapp-setup-view-stores": this._createDataStore.bind(this)
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
								//and will cause infinite loop when creating StatefulModel.
								config.data = getObject(config.data);
							}
							if (appOrView.stores[item].trackable) {
								var trackableCtor;
								try {
									trackableCtor = require("dstore/Trackable");
								} catch (e) {
									throw new Error("dstore/Trackable must be listed in the dependencies");
								}
								// TODO: I was not able to get dstore Trackable working with dcl
								//appOrView.stores[item].store = trackableCtor(new StoreCtor(config));
								//var MyStore = dcl([StoreCtor, trackableCtor], {
								//	get: dcl.superCall(function (sup) {
								//		return function () {
								//			sup.call(this);
								//		}
								//	})
								var MyStore = declare([StoreCtor, trackableCtor], {
									get: function () {
										// need to make sure that this.inherited still works with Trackable
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

			_displayInit: function () {
				// fire the event on the container to load the main view

				// let's display default view
				var initialView = this.app.alwaysUseDefaultView ? this.app.defaultView : this.app._startView;
				var initialParams = this.app.alwaysUseDefaultView ? this.app.defaultParams : this.app._startParams;
				new Promise(function (resolve) {
					this.app.emit("dapp-display", {
						// TODO is that really defaultView a good name? Shouldn't it be defaultTarget or defaultView_s_?
						dest: initialView,
						viewParams: initialParams,
						displayResolve: resolve,
						bubbles: true,
						cancelable: true
					});
				}.bind(this)).then(function () {
					this.app.setStatus(this.app.STARTED);
					this.app.appStartedResolve(this.app); // resolve the appStartedPromise
				}.bind(this));
			}
		});
	});
