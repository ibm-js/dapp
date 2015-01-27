define(["require", "dcl/dcl", "decor/Stateful", "decor/Evented", "requirejs-dplugins/Promise!",
		"./utils/nls", "./utils/hash", "./utils/view", "./utils/config", "requirejs-domready/domReady!"
	],
	function (require, dcl, Stateful, Evented, Promise, nls, hash, viewUtils, configUtils) {

		var Application = dcl([Evented, Stateful], {
			UNKNOWN: 0, //unknown
			STARTED: 1, //started
			STOPPING: 2, //stopping
			STOPPED: 3, //stopped

			status: 0, //unknown

			constructor: function (params, node) {
				dcl.mix(this, params);
				this.domNode = node;
				this.childViews = {};
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
				// returns:
				// 		Promise which is resolved when the showOrHideViews is complete
				var opts = {
					bubbles: true,
					cancelable: true,
					dest: viewPath,
					hash: hash
				};
				var passedResolve = null;
				if (viewParams && viewParams.displayResolve) {
					passedResolve = viewParams.displayResolve;
				}
				return new Promise(function (resolve) {
					dcl.mix(opts,
						viewParams ? viewParams : {
							transition: "slide",
							direction: "end"
						});
					dcl.mix(opts, {
						displayResolve: resolve
					});
					this.emit("dapp-display", opts);
				}.bind(this)).then(function () {
					if (passedResolve) {
						passedResolve();
					}
				});
			},

			createControllers: function (controllers) {
				// summary:
				// 		Create controller instance
				//
				// controllers: Array
				// 		controller configuration array.
				// returns:
				// 		a promise which is resolved when the app controllers are loaded.

				return new Promise(function (resolve) {
					if (controllers) {
						var requireItems = [];
						for (var i = 0; i < controllers.length; i++) {
							requireItems.push(controllers[i]);
						}
						require(requireItems, function () {
							for (var i = 0; i < arguments.length; i++) {
								// instantiate controllers, set Application object, and perform auto binding
								this.loadedControllers.push((new arguments[i](this)).bindAll());
							}
							resolve(this);
						}.bind(this));
					} else {
						resolve();
					}
				}.bind(this));
			},

			// setup default view and Controllers and startup the default view
			start: function () {
				// summary:
				// 		Make calls to setup the Stores, Controllers and nls for the application
				//
				//create application level controllers
				this.setupControllers();
				// if available load root NLS
				return nls(this).then(function (nls) {
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
				return controllers.then(function () {
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
				return new Promise(function (resolve) {
					this.setStatus(this.STOPPING);
					this.emit("dapp-unload-view", {
						view: this,
						parentView: this,
						unloadApp: true,
						callback: function () {
							this.setStatus(this.STOPPED);
							delete window[this.name]; // remove the global for the app
							resolve();
						}.bind(this)
					});

					this.emit("dapp-unload-app", {}); // for controllers to cleanup
				}.bind(this));
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
			// returns:
			// 		Promise which is resolved when the application is started
			var path;

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
				modules.push("requirejs-domready/domReady!");
			}
			return new Promise(function (resolve, reject) {
				require(modules, function () {
					var configModules = [Application].concat(config.modules);
					/*global App:true */
					App = dcl(configModules, config.template ? {
						templateString: arguments[arguments.length - 1]
					} : {});

					var app = new App(config, node || document.body);
					// Create global namespace for application.
					// The global name is application id. For example, modelApp
					var globalAppName = app.id;
					if (window[globalAppName]) {
						dcl.mix(app, window[globalAppName]);
					}
					window[globalAppName] = app;
					app.appStartedResolve = resolve;
					app.start();
				}, function (obj) {
					reject("Application error back from require for modules message =" + obj.message);
				});
			});
		}


		return function (config, node) {
			if (!config) {
				throw new Error("Application Configuration Missing");
			}
			return generateApp(config, node);
		};
	});
