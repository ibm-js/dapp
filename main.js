define(["require", "dojo/_base/kernel", "dcl/dcl", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/config",
		"dojo/Evented", "dojo/Deferred", "dojo/when", "dojo/has", "dojo/on", "dojo/domReady",
		"./utils/nls", "dojo/topic", "./utils/hash", "./utils/constraints", "./utils/config", "dojo/_base/window"
	],
	function (require, kernel, dcl, lang, declare, config, Evented, Deferred, when, has, on, domReady,
		nls, topic, hash, constraints, configUtils) {
		var MODULE = "Main:";

		has.add("app-log-api", (config.app || {}).debugApp);

		var Application = declare(Evented, {
			lifecycle: {
				UNKNOWN: 0, //unknown
				STARTING: 1, //starting
				STARTED: 2, //started
				STOPPING: 3, //stopping
				STOPPED: 4 //stopped
			},

			_status: 0, //unknown

			constructor: function (params, node) {
				dcl.mix(this, params);
				this.domNode = node;
				this.children = {};
				this.loadedStores = {};
				this.loadedControllers = [];
			},

			getStatus: function () {
				// summary:
				//		Get the application status, use the lifecycle status to see what the status is.
				//
				// returns:
				//		the status
				return this._status;
			},

			setStatus: function (newStatus) {
				// summary:
				//		Set the application status, use the lifecycle status to set the status.
				//		The application can subscribe the "/app/status" event to be notified of status changes.
				//
				// newStatus:
				//		The new status it should be one of the lifecycle status like lifecycle.STARTED etc.
				this._status = newStatus;

				// publish /app/status event
				topic.publish("/app/status", newStatus, this.id);
			},

			displayView: function (viewPath, params) {
				// summary:
				//		A convenience function to fire the delite-display event to transition to a view,
				// 		or a set of views.
				//
				// viewPath:
				//		The viewPath to use as the dest for the event, it can be multiple views separated by "+" or
				//		"-" to hide a view, or it can be a nested view with parent,child for example "H1+P1,S1,V1+F1"
				// params:
				//		Contains the params for the event which can include transition and direction.
				var opts = {
					bubbles: true,
					cancelable: true,
					dest: viewPath
				};
				dcl.mix(opts,
					params ? params : {
						transition: "slide",
						direction: "end"
					});
				on.emit(document, "delite-display", opts);
			},

			// TODO: move to a Store controller?
			_createDataStore: function () {
				// summary:
				//		Create data store instance
				if (this.stores) {
					//create stores in the configuration.
					for (var item in this.stores) {
						if (item.charAt(0) !== "_") { //skip the private properties
							var type = this.stores[item].type ? this.stores[item].type : "dojo/store/Memory";
							var config = {};
							if (this.stores[item].params) {
								dcl.mix(config, this.stores[item].params);
							}
							// we assume the store is here through dependencies
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
							this.loadedStores[item] = this.stores[item].store;
						}
					}
				}
			},

			createControllers: function (controllers) {
				// summary:
				// 		Create controller instance
				//
				// controllers: Array
				// 		controller configuration array.
				// returns:
				// 		controllerDeferred object

				if (controllers) {
					var requireItems = [];
					for (var i = 0; i < controllers.length; i++) {
						requireItems.push(controllers[i]);
					}
					var controllerDef = new Deferred();
					require(requireItems, lang.hitch(this, function () {
						for (var i = 0; i < arguments.length; i++) {
							// instantiate controllers, set Application object, and perform auto binding
							this.loadedControllers.push((new arguments[i](this)).bind());
						}
						controllerDef.resolve(this);
					}));
					return controllerDef;
				}
			},

			// setup default view and Controllers and startup the default view
			start: function () {
				// summary:
				// 		Make calls to setup the Stores, Controllers and nls for the application
				//
				//create application level data store
				this._createDataStore();
				//create application level controllers
				this.setupControllers();
				// if available load root NLS
				when(nls(this), lang.hitch(this, function (nls) {
					if (nls) {
						this.nls = {};
						dcl.mix(this.nls, nls);
					}
					this.startup();
				}));
			},

			_addDefaultViewsToPath: function (dest) {
				var F = MODULE + "_addDefaultViewsToPath ";
				var viewPath = dest;
				this.log(MODULE, F + "called with dest=[" + dest + "]");
				var viewDef = this.getViewDefFromDest(dest);
				while (viewDef && viewDef.defaultView) {
					viewPath = viewPath + "," + viewDef.defaultView;
					this.log(MODULE, F + "set viewPath=[" + viewPath + "]");
					viewDef = this.getViewDefFromDest(viewPath);
				}
				this.log(MODULE, F + "final set  returning viewPath=[" + viewPath + "]");
				return viewPath;
			},

			getViewDefFromEvent: function (evnt) {
				var F = MODULE + "getViewDefFromEvent ";
				var viewPath;
				this.log(MODULE, F + "called with evnt.dest=[" + evnt.dest + "]");
				if (evnt.dest.indexOf("_") >= 0) { // viewId?
					this.getViewDefFromViewId(evnt.dest);
					return;
				}
				if (evnt.dapp && evnt.dapp.parentView) { // parent has to be a view to use the id
					if (evnt.dapp.parentView === this) {
						viewPath = evnt.dest;
					} else {
						return this.getViewDefFromViewId(evnt.dapp.parentView.id + "_" + evnt.dest);
					}
				}
				var viewName = evnt.dest;
				if (viewName && viewPath) {
					var parts = viewPath.split(",");
					var viewDef = this;
					//	this.log(MODULE, F + "parts=["+parts+"] viewDef.id=["+viewDef.id+"]");
					for (var item in parts) {
						viewDef = viewDef.views[parts[item]];
						if (parts[item] === viewName) {
							break;
						}
						//this.log(MODULE, F + "item=["+item+"] viewDef.parentSelector=["+viewDef.parentSelector+"]");
					}
					this.log(MODULE, F + "called with viewName=[" + viewName + "] viewPath=[" + viewPath + "]" +
						" returning viewDef.parentSelector=[" + (viewDef ? viewDef.parentSelector : "") + "]");
					return viewDef;
				}
				this.log(MODULE, F + "called with viewName=[" + viewName + "] viewPath=[" + viewPath +
					"] returning null");
				this.log(MODULE, F + "returning null");
				return null;
			},

			getViewDestFromViewid: function (viewId) {
				var F = MODULE + "getViewDestFromViewid ";
				if (viewId) {
					var parts = viewId.split("_");
					var viewDef = this;
					var viewName = "";
					//	this.log(MODULE, F + "parts=["+parts+"] viewDef.id=["+viewDef.id+"]");
					for (var item in parts) {
						viewName = parts[item];
						viewDef = viewDef.views[parts[item]];
						//this.log(MODULE, F + "item=["+item+"] viewDef.parentSelector=["+viewDef.parentSelector+"]");
					}
					this.log(MODULE, F + "called with viewId=[" + viewId +
						" returning viewDef.parentSelector=[" + (viewDef ? viewDef.parentSelector : "") + "]");
					return viewName;
				}
				this.log(MODULE, F + "called with viewId=[" + viewId +
					"] returning viewId");
				this.log(MODULE, F + "returning viewId");
				return viewId;
			},

			getViewDefFromViewId: function (viewId) {
				var F = MODULE + "getViewDefFromViewId ";
				if (viewId) {
					var parts = viewId.split("_");
					var viewDef = this;
					//	this.log(MODULE, F + "parts=["+parts+"] viewDef.id=["+viewDef.id+"]");
					for (var item in parts) {
						viewDef = viewDef.views[parts[item]];
						//this.log(MODULE, F + "item=["+item+"] viewDef.parentSelector=["+viewDef.parentSelector+"]");
					}
					this.log(MODULE, F + "called with viewId=[" + viewId +
						" returning viewDef.parentSelector=[" + (viewDef ? viewDef.parentSelector : "") + "]");
					return viewDef;
				}
				this.log(MODULE, F + "called with viewId=[" + viewId +
					"] returning null");
				this.log(MODULE, F + "returning null");
				return null;
			},

			getViewDefFromDest: function (viewPath) {
				var F = MODULE + "getViewDefFromDest ";
				if (viewPath) {
					var parts = viewPath.split(",");
					var viewDef = this;
					for (var item in parts) {
						viewDef = viewDef.views[parts[item]];
					}
					this.log(MODULE, F + "called with viewPath=[" + viewPath +
						" returning viewDef.parentSelector=[" + (viewDef ? viewDef.parentSelector : "") + "]");
					return viewDef;
				}
				this.log(MODULE, F + "called with viewPath=[" + viewPath + "] returning null");
				return null;
			},

			getViewIdFromEvent: function (event) {
				var dest = event.dest;
				var parentNode = event.target;
				var pViewId;
				if (event.dapp && event.dapp.parentView && event.dapp.parentView !== this) {
					pViewId = event.dapp.parentView.id + "_" + dest;
					return pViewId;
				}
				var pView = this.getParentViewFromViewName(dest, parentNode);
				if (this === pView) { // pView is the app
					return dest;
				}
				// check to see if the parent view has this dest as a child
				var vdef = this.getViewDefFromViewId(pView.id);
				if (vdef && vdef.views && vdef.views[dest]) {
					return pView.id + "_" + dest;
				}
				return dest;

			},

			getParentViewFromViewName: function (viewName, parentNode) {
				if (this.containerNode === parentNode) {
					return this;
				}
				var pNode = parentNode;
				while (!pNode.viewId && pNode.parentNode) {
					pNode = pNode.parentNode;
				}
				// found first parentView from parentNode, now check to see if this view is a child
				if (pNode && pNode.viewId) {
					var parentViewId = pNode.viewId;
					var pView = this.getViewFromViewId(parentViewId);
					while (pView !== this) {
						if (pView.views && pView.views[viewName]) {
							return pView;
						}
						pView = pView.parentView;
					}
				}
				if (!this.views[viewName]) {
					console.error("Did not find parentView will use the app for viewName = " + viewName);
				}
				return this;
			},

			getViewFromViewId: function (viewId) {
				//var F = MODULE + "getViewFromViewId ";
				if (viewId) {
					var parts = viewId.split("_");
					var view = this;
					var nextChildId = "";
					for (var item in parts) {
						var childId = nextChildId + parts[item];
						view = view.children[childId];
						nextChildId = childId + "_";
					}
					return view;
				}
				return null;
			},

			getParentViewFromViewId: function (viewId) {
				//var F = MODULE + "getParentViewFromViewId ";
				if (viewId) {
					var parts = viewId.split("_");
					parts.pop();
					var view = this;
					var nextChildId = "";
					for (var item in parts) {
						var childId = nextChildId + parts[item];
						view = view.children[childId];
						nextChildId = childId + "_";
					}
					return view;
				}
				return null;
			},

			setupControllers: function () {
				// create application controller instance
				// move set _startView operation from history module to application
				//var F = MODULE + "setupControllers ";

				var currentHash = window.location.hash;
				this._startView = hash.getTarget(currentHash, this.defaultView);
				this._startParams = hash.getParams(currentHash);
			},

			startup: function () {
				// load controllers and views
				//
				this.selectedChildren = {};
				var controllers = this.createControllers(this.controllers);
				// constraint on app
				if (this.hasOwnProperty("constraint")) {
					constraints.register(this.constraints);
				} else {
					this.constraint = "center";
				}
				when(controllers, lang.hitch(this, function () {
					// emit "app-init" event so that the Init controller can initialize the app and the root view
					this.emit("app-init", {});
				}));
			},

			unloadApp: function () {
				// summary:
				//		Unload the application, and all of its child views.
				// 		set the status for STOPPING during the unload and STOPPED when complete
				// 		emit app-unload-view to have controllers stop, and delete the global app reference.
				//
				var F = MODULE + "unloadApp ";
				var appStoppedDef = new Deferred();
				this.setStatus(this.lifecycle.STOPPING);
				this.emit("app-unload-app", {}); // for controllers to cleanup

				var params = {};
				params.view = this;
				params.parentView = this;
				params.unloadApp = true;
				params.callback = lang.hitch(this, function () {
					this.setStatus(this.lifecycle.STOPPED);
					delete window[this.name]; // remove the global for the app
					appStoppedDef.resolve();
				});
				this.log(MODULE, F + "emit app-unload-view for [" + this.id + "]");
				this.emit("app-unload-view", params);
				return appStoppedDef;
			},

			_getViewPaths: function (viewPaths) {
				// summary:
				//		Extracts the views form the specified string and returns an array of objects.
				//		Each element in the array is a sibling or cousin view and in turn contains a lineage.
				//		The returned array takes the following form:
				//		[
				//			{ dest: "ViewName",
				//				remove: true|false,
				//				lineage: [ "ViewName", "ViewName", ... ]
				//			},
				//			{ dest: "viewDest",
				//				remove: true|false,
				//				lineage: [ "ViewName", "ViewName", ... ]
				//			},
				//			. . .
				//		]
				//
				if (viewPaths.trim().length <= 0) {
					return null;
				}
				var sepIndices = this.destIndexesOf(viewPaths, "+-");
				var siblings = this.destSplit(viewPaths, "+-");
				var result = [];
				var index = 0;
				var removes = [];
				var sepIndex = 0;
				var sep = "";
				for (index = 0; index < sepIndices.length; index++) {
					sepIndex = sepIndices[index];
					sep = viewPaths.charAt(sepIndex);
					removes.push(sep === "-" ? true : false);
				}
				if ((sepIndices.length > 0) && (sepIndices[0] === 0)) {
					// we begin with a separator so ignore first sibling
					// which should be empty-string
					siblings.shift();
				} else {
					// the first character is not a plus or minux, so assume
					// it is a plus by default so the first sibling is an add
					removes.unshift(false);
				}
				for (index = 0; index < siblings.length; index++) {
					var lastViewDef = this.getViewDefFromDest(siblings[index]);
					if (!removes[index] && lastViewDef.defaultView) {
						siblings[index] = this._addDefaultViewsToPath(siblings[index]);
					}
					result.push({
						dest: siblings[index],
						remove: removes[index],
						lineage: this.destSplit(siblings[index], ","),
						syncLoadView: lastViewDef.syncLoadView,
						lastViewId: siblings[index].replace(/,/g, "_")
					});
				}
				return result;
			},

			destIndexesOf: function ( /*string*/ text, /*string*/ chars) {
				// summary:
				//		Searches the specified text for the first index of a character contained in the specified
				//		string of characters.
				// text: string
				// 		The text to search.
				// chars: string
				// 		The characters for which to search (any of these).
				// returns: {Number[]}
				//		The array of indexes at which one of the specified characters is found or an empty array
				// 		if not found.
				//
				if (!chars || (chars.length === 0)) {
					throw "One or more characters must be provided to search for unescaped characters: " + " chars=[ " +
						chars + " ], text=[ " + text + " ]";
				}
				var result = [];
				var index = 0;
				var current = null;
				for (index = 0; index < text.length; index++) {
					current = text.charAt(index);
					if (chars.indexOf(current) >= 0) {
						result.push(index);
					}
				}
				return result;
			},

			destSplit: function ( /*string*/ text, /*string*/ separators) {
				// summary:
				//		split the the specified text on separator characters
				// text: string
				// 		The text to split.
				// separators: string
				// 		The characters for which to split (any of these).
				// returns: {String[]}
				//		Return an array of string parts.
				//
				if (!separators || (separators.length === 0)) {
					separators = ",";
				}
				var result = [];
				var index = 0;
				var current = null;
				var start = 0;
				for (index = 0; index < text.length; index++) {
					current = text.charAt(index);
					if (separators.indexOf(current) >= 0) {
						if (start === index) {
							result.push("");
						} else {
							result.push(text.substring(start, index));
						}
						start = index + 1;
					}
				}
				if (start === text.length) {
					result.push("");
				} else {
					result.push(text.substring(start));
				}
				return result;
			},

			log: function () {} // noop may be replaced by a logger controller


		});

		function generateApp(config, node) {
			// summary:
			//		generate the application
			//
			// config: Object
			// 		app config
			// node: domNode
			// 		domNode.
			var path;
			var appStartedDef = new Deferred();

			// call configProcessHas to process any has blocks in the config
			config = configUtils.configProcessHas(config);

			if (!config.loaderConfig) {
				config.loaderConfig = {};
			}
			if (!config.loaderConfig.paths) {
				config.loaderConfig.paths = {};
			}
			if (!config.loaderConfig.paths.app) {
				// Register application module path
				path = window.location.pathname;
				if (path.charAt(path.length) !== "/") {
					path = path.split("/");
					path.pop();
					path = path.join("/");
				}
				config.loaderConfig.paths.app = path;
			}

			/* global requirejs */
			if (window.requirejs) {
				requirejs.config(config.loaderConfig);
			} else {
				// Dojo loader?
				require(config.loaderConfig);
			}

			if (!config.modules) {
				config.modules = [];
			}
			var modules = config.modules.concat(config.dependencies ? config.dependencies : []);

			if (config.template) {
				path = config.template;
				if (path.indexOf("./") === 0) {
					path = "app/" + path;
				}
				modules.push("requirejs-text/text!" + path);
			}

			require(modules, function () {
				var modules = [Application];
				for (var i = 0; i < config.modules.length; i++) {
					modules.push(arguments[i]);
				}

				var ext;
				if (config.template) {
					ext = {
						templateString: arguments[arguments.length - 1]
					};
				}
				/*global App:true */
				App = declare(modules, ext);


				domReady(function () {
					var app = new App(config, node || document.body);
					app.setStatus(app.lifecycle.STARTING);
					// Create global namespace for application.
					// The global name is application id. For example, modelApp
					var globalAppName = app.id;
					if (window[globalAppName]) {
						dcl.mix(app, window[globalAppName]);
					}
					window[globalAppName] = app;
					app.appStartedDef = appStartedDef;
					app.start();
				});
			}, function (obj) {
				console.error("error back from require message =" + obj.message);
			});
			return appStartedDef;
		}


		return function (config, node) {
			if (!config) {
				throw new Error("Application Configuration Missing");
			}
			return generateApp(config, node);
		};
	});
