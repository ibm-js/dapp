define(["require", "dcl/dcl", "decor/Stateful", "decor/Evented", "dojo/Deferred", "dojo/when",
		"./utils/nls", "./utils/hash", "./utils/view", "./utils/config", "requirejs-domready/domReady!"
	],
	function (require, dcl, Stateful, Evented, Deferred, when, nls, hash, viewUtils, configUtils) {

		var Application = dcl([Evented, Stateful], {
			UNKNOWN: 0, //unknown
			STARTED: 1, //started
			STOPPING: 2, //stopping
			STOPPED: 3, //stopped

			status: 0, //unknown

			constructor: function (params, node) {
				dcl.mix(this, params);
				this.domNode = node;
				this.children = {};
				this.loadedStores = {};
				this.loadedControllers = [];
			},

			setStatus: function (status) {
				this.status = status;
				this.emit("dapp-status-change", {
					status: this.status
				});
			},

			showOrHideViews: function (viewPath, viewParams, hash) {
				// summary:
				//		A convenience function to fire the dapp-display event to transition to a view,
				// 		or a set of views.
				//
				// viewPath:
				//		The viewPath to use as the dest for the event, it can be multiple views separated by "+" or
				//		"-" to hide a view, or it can be a nested view with parent,child for example "H1+P1,S1,V1+F1"
				// viewParams:
				//		Contains the viewParams for the event which can include transition and direction.
				var opts = {
					bubbles: true,
					cancelable: true,
					dest: viewPath,
					hash: hash
				};
				dcl.mix(opts,
					viewParams ? viewParams : {
						transition: "slide",
						direction: "end"
					});
				this.emit("dapp-display", opts);
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
							this.loadedControllers.push((new arguments[i](this)).bindAll());
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

				var currentHash = window.location.hash;
				this._startView = hash.getTarget(currentHash, this.defaultView);
				this._startParams = hash.getViewParams(currentHash);
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
				var appStoppedDef = new Deferred();
				this.setStatus(this.STOPPING);
				var params = {};
				params.view = this;
				params.parentView = this;
				params.unloadApp = true;
				params.callback = function () {
					this.setStatus(this.STOPPED);
					delete window[this.name]; // remove the global for the app
					appStoppedDef.resolve();
				}.bind(this);
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

				require(["requirejs-domready/domReady!"], function () {
					var app = new App(config, node || document.body);
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
