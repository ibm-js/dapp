define(["require", "dcl/dcl", "dojo/_base/lang", "delite/Stateful",
		"dojo/_base/config", "dojo/Evented", "dojo/Deferred", "dojo/when", "dojo/has", "dojo/on", "dojo/domReady",
		"./utils/nls", "dojo/topic", "./utils/hash", "./utils/viewUtils", "./utils/config"
	],
	function (require, dcl, lang, Stateful, dconfig, Evented, Deferred, when, has, on, domReady,
		nls, topic, hash, viewUtils, configUtils) {
		var MODULE = "Main:";

		has.add("app-log-api", (dconfig.app || {}).debugApp);

		var Application = dcl([Evented, Stateful], {
			lifecycle: {
				UNKNOWN: 0, //unknown
				STARTING: 1, //starting
				STARTED: 2, //started
				STOPPING: 3, //stopping
				STOPPED: 4 //stopped
			},

			status: 0, //unknown

			constructor: function (params, node) {
				dcl.mix(this, params);
				this.domNode = node;
				this.children = {};
				this.loadedStores = {};
				this.loadedControllers = [];
				//TODO: do we need to save and remove this watch on unload?
				this.watch("status", function (name, oldValue, value) {
					topic.publish("/dapp/status", value, this.id);
				});
			},

			showOrHideView: function (viewPath, params) {
				// summary:
				//		A convenience function to fire the dapp-display event to transition to a view,
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
				on.emit(document, "dapp-display", opts);
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
							if (config.data && typeof config.data === "string") {
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
					require(requireItems, function () {
						for (var i = 0; i < arguments.length; i++) {
							// instantiate controllers, set Application object, and perform auto binding
							this.loadedControllers.push((new arguments[i](this)).bind());
						}
						controllerDef.resolve(this);
					}.bind(this));
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
				when(nls(this), function (nls) {
					if (nls) {
						this.nls = {};
						dcl.mix(this.nls, nls);
					}
					this.startup();
				}.bind(this));
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
					viewUtils.register(this.constraints);
				} else {
					this.constraint = "center";
				}
				when(controllers, function () {
					// emit "dapp-init" event so that the Init controller can initialize the app and the root view
					this.emit("dapp-init", {});
				}.bind(this));
			},

			unloadApp: function () {
				// summary:
				//		Unload the application, and all of its child views.
				// 		set the status for STOPPING during the unload and STOPPED when complete
				// 		emit dapp-unload-view to have controllers stop, and delete the global app reference.
				//
				var F = MODULE + "unloadApp ";
				var appStoppedDef = new Deferred();
				this.status = this.lifecycle.STOPPING;

				var params = {};
				params.view = this;
				params.parentView = this;
				params.unloadApp = true;
				params.callback = function () {
					this.status = this.lifecycle.STOPPED;
					delete window[this.name]; // remove the global for the app
					appStoppedDef.resolve();
				}.bind(this);
				this.log(MODULE, F + "emit dapp-unload-view for [" + this.id + "]");
				this.emit("dapp-unload-view", params);

				this.emit("dapp-unload-app", {}); // for controllers to cleanup
				return appStoppedDef;
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

				var ext = {};
				if (config.template) {
					ext = {
						templateString: arguments[arguments.length - 1]
					};
				}
				/*global App:true */
				App = dcl(modules, ext);

				domReady(function () {
					var app = new App(config, node || document.body);
					app.status = app.lifecycle.STARTING;
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
				throw new Error("Application error back from require for modules message =" + obj.message);
			});
			return appStartedDef.promise;
		}


		return function (config, node) {
			if (!config) {
				throw new Error("Application Configuration Missing");
			}
			return generateApp(config, node);
		};
	});
