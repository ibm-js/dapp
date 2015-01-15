define(
	["dcl/dcl", "../Controller", "dcl/advise", "dapp/utils/view", "../ViewBase", "../View"],
	function (dcl, Controller, advise, viewUtils, ViewBase, View) {
		var app; // need app in closure for loadMapper
		return dcl(Controller, {
			constructor: function () {
				// summary:
				//		A custom logger to handle logging based upon config options for loggingList, logAll, and
				// 		logTimeStamp.
				//
				this.app.appLogging = this.app.appLogging || {};
				app = this.app;

				this.events = {
					"dapp-status-change": this.dappstatuschange.bind(this),
					"delite-display-load": this.delitedisplayload.bind(this),
					"dapp-unload-view": this.dappunloadview.bind(this)
				};

				if (this.app.appLogging.logAll) {
					var signal = advise.before(viewUtils, "setSelectedChild",
						function (view, constraint, child, app) { // jshint unused:false
							var type = typeof (constraint);
							var hash = (type === "string" || type === "number") ? constraint : constraint.__hash;
							if (child) {
								console.log("  > utils/view.setSelectedChild view.id=[" + view.id +
									"] has selectedChildren set for [" + child.id + "] with hash=[" + hash + "]");
							} else {
								console.log("  > utils/view.setSelectedChild view.id=[" + view.id +
									"] setting selectedChild to null with hash=[" + hash + "]");
							}
						}.bind(this), true);
					this._boundEvents.push({
						"event": "setSelectedChild",
						"signal": signal
					});
				}

				if (this.app.appLogging.logAll) {
					signal = advise.before(this.app, "emit",
						function (evttype, params) { // jshint unused:false
							var msg = "> app.emit for evttype=[" + evttype + "]";
							if (evttype === "dapp-init") {
								msg = msg + " for app.id=[" + this.app.id + "]";
							}
							if (evttype === "dapp-status-change") {
								msg = msg + " status=[" + params.status + "] for app.id=[" + this.app.id + "]";
							}
							if (evttype === "dapp-display") {
								msg = msg + " **NEW TRANSITION**";
							}
							if (params.dest) {
								msg = msg + " dest=[" + params.dest + "]";
							}
							if (params.dapp && params.dapp.parentView.id) {
								msg = msg + " dapp.parentView.id=[" + params.dapp.parentView.id + "]";
							}
							if (params.hide) {
								msg = msg + " dapp.hide=[" + params.hide + "]";
							}

							if (evttype === "dapp-setup-view-stores") {
								msg = msg + " event.id=[" + params.id + "] for app.id=[" + this.app.id + "]";
							}

							console.log(msg);
						}.bind(this), true);
					this._boundEvents.push({
						"event": "setSelectedChild",
						"signal": signal
					});
				}

				if (this.app.appLogging.logAll || this.app.appLogging.logViews) {
					this.setupAdvisesForViews();
				}
			},

			dappstatuschange: function (params) {
				// Note app.status = app.STARTING is done in Application.js on domReady,
				// so this is too late for 1.
				var status = params.status;
				if (this.app.appLogging.logAll) {
					if (status === this.app.STARTED) {
						//Once the app is started we can add advise before or after for methods in other controllers
						for (var i = 0; i < this.app.controllers.length; i++) {
							// log things from the load controller here
							if (this.app.controllers[i] === "dapp/controllers/delite/Load") {
								this.setupAdvisesForLoadController(this.app.loadedControllers[i]);
							}
							if (this.app.controllers[i] === "dapp/controllers/delite/Transition") {
								this.setupAdvisesForTransitionController(this.app.loadedControllers[i]);
							}
						}
					}
				}
			},
			logBeforeAfterShowHideDisplay: function (selfApp, value, event, show, before, handle) {
				// If the value.dest does not match the one we are expecting keep waiting
				if (app !== selfApp) { // if wrong app ignore the load request
					console.warn(value.type + " called for the wrong application app.id=" +
						selfApp.id + " value.dest=" + value.dest);
					return;
				}
				if (value.dest !== event.dest) { // if this delite-after-show is not for this view return
					return;
				}
				handle.remove(); // remove the handle when we match value.dest
				console.log("  > " + value.type + " fired value.dest=[" + value.dest +
					"] event.dapp.parentView.id=[" +
					(event.dapp.parentView ? event.dapp.parentView.id : "") + "]");
			},
			delitedisplayload: function (event) {
				var self = this;
				if (this.app.appLogging.logAll || this.app.appLogging.logDisplayLoad) {
					if (app !== this.app) { // if wrong app ignore the load request
						console.warn("delite-display-load fired for the wrong application this.app.id=" +
							this.app.id + " event.dest=" + event.dest);
					}
					if (!event.dapp) {
						console.log("> delite-display-load fired no event.dapp with event.dest=[" + event.dest +
							"] event.hide=[" + event.hide + "] this.app.id=[" + this.app.id + "]");
					}
					if (typeof event.dest !== "string") {
						return;
					}
					if (event.loadPromise) {
						event.loadPromise.then(function (value) {
							console.log("  < back from delite-display-load resolveView with value.child.id=[" +
								value.child.id + "] value.dapp.parentView.id=[" +
								(value.dapp && value.dapp.parentView ? value.dapp.parentView.id : "") + "]");
						});
					}
					if (event.dapp && event.dapp.dest && !event.dapp.hide) {
						if (event.target.on) {
							var onbeforeShowDisplayHandle = event.target.on("delite-before-show", function (value) {
								this.logBeforeAfterShowHideDisplay(self.app, value, event, true, false,
									onbeforeShowDisplayHandle);
							}.bind(this));
							var onafterShowDisplayHandle = event.target.on("delite-after-show", function (value) {
								this.logBeforeAfterShowHideDisplay(self.app, value, event, false, false,
									onafterShowDisplayHandle);
							}.bind(this));
						}
					} else { // hide
						if (event.target.on) {
							var onbeforeHideDisplayHandle = event.target.on("delite-before-hide", function (value) {
								this.logBeforeAfterShowHideDisplay(self.app, value, event, true, true,
									onbeforeHideDisplayHandle);
							}.bind(this));
							var onafterHideDisplayHandle = event.target.on("delite-after-hide", function (value) {
								this.logBeforeAfterShowHideDisplay(self.app, value, event, false, true,
									onafterHideDisplayHandle);
							}.bind(this));
						}
					}
				}
			},
			dappunloadview: function (event) {
				if (this.app.appLogging.logAll) {
					console.log(" > dapp-unload-view fired with event.view.id=[" + event.view.id +
						"] this.app.id=[" + this.app.id + "]");
				}
			},

			setupAdvisesForViews: function () {
				var signal = advise.before(ViewBase.prototype, "start",
					function () {
						console.log("  > dapp/ViewBase.start called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"event": "start",
					"signal": signal
				});
				signal = advise.before(View.prototype, "start",
					function () {
						console.log("  > dapp/View.start called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"event": "start",
					"signal": signal
				});
				signal = advise.before(View.prototype, "load",
					function () {
						console.log("  > dapp/View.load called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"event": "load",
					"signal": signal
				});
				signal = advise.before(ViewBase.prototype, "_loadViewController",
					function () {
						console.log("  > dapp/ViewBase._loadViewController called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"event": "_loadViewController",
					"signal": signal
				});
				signal = advise.before(View.prototype, "_loadTemplate",
					function () {
						console.log("  > dapp/View._loadTemplate called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"event": "_loadTemplate",
					"signal": signal
				});
				signal = advise.before(View.prototype, "_startup",
					function () {
						console.log("  > dapp/View._startup called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"event": "_startup",
					"signal": signal
				});
				signal = advise.before(ViewBase.prototype, "_initViewHidden",
					function () {
						console.log("  > dapp/ViewBase._initViewHidden called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"event": "_initViewHidden",
					"signal": signal
				});
				signal = advise.before(ViewBase.prototype, "_startLayout",
					function () {
						console.log("  > dapp/ViewBase._startLayout called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"event": "_startLayout",
					"signal": signal
				});
			},

			setupAdvisesForLoadController: function (loadController) {
				var signal = advise.before(loadController,
					"_handleBeforeDeactivateCalls",
					function (subs, next, current, data) { // jshint unused:false
						for (var i = subs.length - 1; i >= 0; i--) {
							var v = subs[i];
							if (v && v.beforeDeactivate && v._active) {
								console.log("   < beforeDeactivate called v.id=[" + v.id + "]");
							} else if (v && !v._active) {
								console.log("   < beforeDeactivate not called for v.id=[" +
									v.id + "] because v._active is false");
							}
						}
					}, true);
				this._boundEvents.push({
					"event": "_handleBeforeDeactivateCalls",
					"signal": signal
				});
				signal = advise.before(loadController, "_handleBeforeActivateCalls",
					function (subs, current, data) { // jshint unused:false
						for (var i = subs.length - 1; i >= 0; i--) {
							var v = subs[i];
							if (!v.initialized) {
								console.log("   > init called v.id=[" + v.id + "]");
							}
							if (v && v.beforeActivate) {
								console.log("   > beforeActivate called v.id=[" + v.id + "]");
							}
						}
					}, true);
				this._boundEvents.push({
					"event": "_handleBeforeActivateCalls",
					"signal": signal
				});
				signal = advise.before(loadController, "_handleAfterActivateCalls",
					function (subs, removeView, current, data) { // jshint unused:false
						var startInt = 0;
						if (removeView && subs.length > 1) {
							startInt = 1;
						}
						for (var i = startInt; i < subs.length; i++) {
							var v = subs[i];
							if (v.afterActivate) {
								console.log("   > afterActivate called v.id=[" +
									v.id + "] setting _active true");
							}
						}
					}, true);
				this._boundEvents.push({
					"event": "_handleAfterActivateCalls",
					"signal": signal
				});
				signal = advise.before(loadController, "_handleAfterDeactivateCalls",
					function (subs, next, current, data) { // jshint unused:false
						if (subs) {
							//now we need to loop forwards thru subs calling afterDeactivate
							for (var i = 0; i < subs.length; i++) {
								var v = subs[i];
								if (v && v.afterDeactivate && v._active) {
									console.log("   < afterDeactivate called v.id=[" +
										v.id + "] setting _active false");
								}
							}
						}
					}, true);
				this._boundEvents.push({
					"event": "_handleAfterDeactivateCalls",
					"signal": signal
				});
			},

			setupAdvisesForTransitionController: function (transitionController) {
				var signal = advise.before(transitionController, "_handleMultipleViewParts",
					function (event) {
						console.log(" > Transition._handleMultipleViewParts called event.dest=[" + event.dest +
							"] and event.viewData=[" + event.viewData + "]");
					}, true);
				this._boundEvents.push({
					"event": "_handleMultipleViewParts",
					"signal": signal
				});
				signal = advise.before(transitionController, "_hideView",
					function (viewTarget, event, isParent, viewPath) { // jshint unused:false
						console.log(" > Transition._hideView called for viewTarget [" +
							viewTarget + "] with event.dest = [" + event.dest + "] ");
					}, true);
				this._boundEvents.push({
					"event": "_hideView",
					"signal": signal
				});
				signal = advise.before(transitionController, "_displayView",
					function (viewTarget, event, isParent, viewPath) { // jshint unused:false
						console.log(" > Transition._displayView called for viewTarget [" +
							viewTarget + "] with event.dest = [" + event.dest + "] ");
					}, true);
				this._boundEvents.push({
					"event": "_displayView",
					"signal": signal
				});
				signal = advise.before(transitionController, "_displayParents",
					function (viewTarget, event, isParent, viewPath) { // jshint unused:false
						console.log(" > Transition._displayParents called for viewTarget [" +
							viewTarget + "]");
					}, true);
				this._boundEvents.push({
					"event": "_displayParents",
					"signal": signal
				});
			}
		});
	});
