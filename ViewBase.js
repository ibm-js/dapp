define(["require", "dcl/dcl", "lie/dist/lie", "dapp/utils/view"],
	function (require, dcl, Promise, viewUtils) {
		return dcl(null, {
			// summary:
			//		View base class with controller capabilities. Subclass must implement rendering capabilities.
			attributes: {},
			constructor: function (viewParams) {
				// summary:
				//		Constructs a ViewBase instance.
				// viewParams:
				//		view parameters, include:
				//
				//		- app: the app
				//		- id: view id
				//		- viewName: view name
				//		- parent: parent view
				//		- controller: view controller module identifier
				//		- children: children views
				this.id = "";
				this.viewName = "";
				this.childViews = {};
				this.selectedChildren = {};
				this.loadedStores = {};
				this.transitionCount = 0;

				// private
				this._started = false;
				dcl.mix(this, viewParams);
				var p = this.parentView;
				// mixin views configuration to current view instance.
				if (p && p.views) {
					dcl.mix(this, p.views[this.viewName]);
				}
			},

			// start view
			start: function () {
				// summary:
				//		start view object.
				//		load view template, view controller implement and startup all widgets in view template.
				if (this._started) {
					return this;
				}
				return new Promise(function (resolve) {
					this._startResolve = resolve;
					return this.load().then(function (controller) {
						this._createDataStores();
						this._startup(controller);
					}.bind(this));
				}.bind(this));

			},

			load: function () {
				return this._loadViewController().then(function (controller) {
					if (controller) {
						dcl.mix(this, controller);
						return controller;
					}
				}.bind(this));
			},

			_createDataStores: function () {
				// summary:
				//		Create data store instances for View specific stores
				//
				if (this.parentView && this.parentView.loadedStores) {
					dcl.mix(this.loadedStores, this.parentView.loadedStores);
				}

				if (this.stores) {
					//create stores in the configuration.
					this.app.emit("dapp-setup-view-stores", this);
				}
			},

			_startup: function () {
				// summary:
				//		startup widgets in view template.
				// tags:
				//		private
				this._initViewHidden();

				this._startLayout();
			},

			_initViewHidden: function () {
				this.domNode.style.visibility = "hidden";
			},

			_startLayout: function () {
				// summary:
				//		startup widgets in view template.
				// tags:
				//		private
				if (!this.hasOwnProperty("constraint")) {
					this.constraint = this.domNode.getAttribute("data-app-constraint") ||
						viewUtils.getDefaultConstraint(this.id, this.parentNode);
					this.domNode.constraint = this.constraint;
				}
				viewUtils.register(this.constraint);

				this._started = true;
				if (this._startResolve) {
					this._startResolve(this);
				}
			},

			_loadViewController: function () {
				// summary:
				//		Load view controller by configuration or by default.
				// tags:
				//		private
				//
				var path;

				//TODO: There is a problem with the order of views being added if no controller is listed
				//TODO: Seems like order problem can be solved by using ViewBase if it is not set, try this for now!
				return new Promise(function (resolve) {
					if (!this.controller) {
						this.controller = "dapp/ViewBase";
					}
					path = this.controller.replace(/(\.js)$/, "");
					require([path], function (controller) {
						resolve(controller);
					});
				}.bind(this));
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

			beforeDestroy: function () {
				// summary:
				//		view life cycle beforeDestroy() to do controller specific cleanup
			}

		});
	});
