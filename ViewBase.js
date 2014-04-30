define(["require", "dojo/when", "dojo/on", "dojo/dom-attr", "dojo/dom-style", "dojo/dom-class", "dojo/_base/declare",
		"dojo/_base/lang", "dcl/dcl", "dojo/Deferred", "./utils/viewUtils"
	],
	function (require, when, on, domAttr, domStyle, domClass, declare, lang, dcl, Deferred, viewUtils) {
		var MODULE = "ViewBase:";
		return declare(null, {
			// summary:
			//		View base class with controller capabilities. Subclass must implement rendering capabilities.
			attributes: {},
			constructor: function (params) {
				// summary:
				//		Constructs a ViewBase instance.
				// params:
				//		view parameters, include:
				//
				//		- app: the app
				//		- id: view id
				//		- viewName: view name
				//		- parent: parent view
				//		- controller: view controller module identifier
				//		- children: children views
				var F = MODULE + "constructor ";
				this.id = "";
				this.viewName = "";
				this.children = {};
				this.selectedChildren = {};
				this.loadedStores = {};
				this.transitionCount = 0;

				// private
				this._started = false;
				dcl.mix(this, params);
				var p = this.parentView;
				// mixin views configuration to current view instance.
				if (p && p.views) {
					dcl.mix(this, p.views[this.viewName]);
				}
				this.app.log(MODULE, F + "called for [" + this.id + "]");
			},

			// start view
			start: function () {
				// summary:
				//		start view object.
				//		load view template, view controller implement and startup all widgets in view template.
				var F = MODULE + "start ";
				this.app.log(MODULE, F + "called for [" + this.id + "]");
				if (this._started) {
					return this;
				}
				this._startDef = new Deferred();
				when(this.load(), function () {
					this._createDataStores();
					this._startup();
				}.bind(this));
				return this._startDef;
			},

			load: function () {
				var F = MODULE + "load ";
				this.app.log(MODULE, F + "called for [" + this.id + "]");
				var vcDef = this._loadViewController();
				when(vcDef, function (controller) {
					if (controller) {
						dcl.mix(this, controller);
					}
				}.bind(this));
				return vcDef;
			},

			_createDataStores: function () {
				// summary:
				//		Create data store instances for View specific stores
				//
				// TODO: move this into a common place for use by main and ViewBase
				//
				var F = MODULE + "_createDataStores ";
				this.app.log(MODULE, F + "called for [" + this.id + "]");
				if (this.parentView && this.parentView.loadedStores) {
					dcl.mix(this.loadedStores, this.parentView.loadedStores);
				}

				if (this.stores) {
					//create stores in the configuration.
					for (var item in this.stores) {
						if (item.charAt(0) !== "_") { //skip the private properties
							var type = this.stores[item].type ? this.stores[item].type : "dojo/store/Memory";
							var config = {};
							if (this.stores[item].params) {
								dcl.mix(config, this.stores[item].params);
							}
							this._createDataStore(item, type, config);
						}

					}
				}
			},

			_createDataStore: function (item, type, config) {
				// summary:
				//		Create a data store instance for View specific store
				//
				// TODO: move this into a common place for use by main and ViewBase
				//
				var F = MODULE + "_createDataStore ";
				this.app.log(MODULE, F + "called for [" + this.id + "]");
				var StoreCtor;
				try {
					StoreCtor = require(type);
				} catch (e) {
					throw new Error(type + " must be listed in the dependencies");
				}
				if (config.data && lang.isString(config.data)) {
					//get the object specified by string value of data property
					//cannot assign object literal or reference to data property
					//because json.ref will generate __parent to point to its parent
					//and will cause infinitive loop when creating StatefulModel.
					config.data = lang.getObject(config.data);
				}
				if (this.stores[item].observable) {
					var observableCtor;
					try {
						observableCtor = require("dojo/store/Observable");
					} catch (e) {
						throw new Error("dojo/store/Observable must be listed in the dependencies");
					}
					this.stores[item].store = observableCtor(new StoreCtor(config));
				} else {
					this.stores[item].store = new StoreCtor(config);
				}
				this.loadedStores[item] = this.stores[item].store; // add store to loadedStores for the view
			},

			_startup: function () {
				// summary:
				//		startup widgets in view template.
				// tags:
				//		private
				var F = MODULE + "_startup ";
				this.app.log(MODULE, F + "called for [" + this.id + "]");

				this._initViewHidden();

				this._startLayout();
			},

			_initViewHidden: function () {
				var F = MODULE + "_initViewHidden ";
				this.app.log(MODULE, F + "called for [" + this.id + "]");
				domStyle.set(this.domNode, "visibility", "hidden");
			},

			_startLayout: function () {
				// summary:
				//		startup widgets in view template.
				// tags:
				//		private
				var F = MODULE + "_startLayout ";
				this.app.log(MODULE, F + "called for [" + this.id + "]");

				this.app.log(MODULE, F + "  >  firing layout for name=[" + this.viewName +
					"], parentView.viewName=[" + (this.parentView ? this.parentView.viewName : "") + "]");

				if (!this.hasOwnProperty("constraint")) {
					this.constraint = domAttr.get(this.domNode, "data-app-constraint") || "center";
				}
				viewUtils.register(this.constraint);

				this.app.log("  > in app/ViewBase calling this.startup and resolve() id=[" + this.id + "], " +
					"parentView.viewName=[" + (this.parentView ? this.parentView.viewName : "") + "]");
				this._started = true;
				if (this._startDef) {
					this._startDef.resolve(this);
				}
			},

			_loadViewController: function () {
				// summary:
				//		Load view controller by configuration or by default.
				// tags:
				//		private
				//
				var F = MODULE + "_loadViewController ";
				this.app.log(MODULE, F + "called for [" + this.id + "]");
				var viewControllerDef = new Deferred();
				var path;

				//TODO: There is a problem with the order of views being added if no controller is listed
				//TODO: Seems like order problem can be solved by using ViewBase if it is not set, try this for now!
				if (!this.controller) {
					this.controller = "dapp/ViewBase";
				}
				if (!this.controller) { // no longer using this.controller === "none", if we dont have one it means none
					this.app.log(MODULE, F + "  > no controller set for view name=[" + this.viewName +
						"], parentView.viewName=[" + this.parentView.viewName, "]");
					viewControllerDef.resolve(true);
					return viewControllerDef;
				} else {
					path = this.controller.replace(/(\.js)$/, "");
				}

				require([path], function (controller) {
					viewControllerDef.resolve(controller);
				});
				return viewControllerDef;
			},

			init: function () {
				// summary:
				//		view life cycle init()
			},

			beforeActivate: function () {
				// summary:
				//		view life cycle beforeActivate()
			},

			afterActivate: function () {
				// summary:
				//		view life cycle afterActivate()
			},

			beforeDeactivate: function () {
				// summary:
				//		view life cycle beforeDeactivate()
			},

			afterDeactivate: function () {
				// summary:
				//		view life cycle afterDeactivate()
			},

			destroy: function () {
				// summary:
				//		view life cycle destroy()
			}
		});
	});
