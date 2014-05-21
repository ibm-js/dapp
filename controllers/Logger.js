define(
	["dcl/dcl", "dojo/on", "../Controller", "dojo/topic", "dojo/aspect", "dapp/utils/view",
		"../ViewBase", "../View"
	],
	function (dcl, on, Controller, topic, aspect, viewUtils, ViewBase, View) {
		return dcl(Controller, {
			constructor: function () {
				// summary:
				//		A custom logger to handle logging based upon config options for loggingList, logAll, and
				// 		logTimeStamp.
				//
				this.app.appLogging = this.app.appLogging || {};

				this.docEvents = {
					"dapp-display": this.dappdisplay,
					"delite-display-load": this.delitedisplayload,
					"dapp-status-change": this.dappstatuschange
				};
				this.events = {
					"dapp-init": this.dappinit,
					"dapp-unload-view": this.dappunloadview,
					"dapp-setup-view-stores": this.dappsetupviewstores,
					"delite-before-show": this.delitebeforeshow,
					"delite-before-hide": this.delitebeforehide
				};

				var signal = aspect.after(viewUtils, "setSelectedChild",
					function (view, constraint, child, app) { // jshint unused:false
						if (this.app.appLogging.logAll) {
							var type = typeof (constraint);
							var hash = (type === "string" || type === "number") ? constraint : constraint.__hash;
							if (child) {
								console.log("  > utils/view.setSelectedChild view.id=[" + view.id +
									"] has selectedChildren set for [" + child.id + "] with hash=[" + hash + "]");
							} else {
								console.log("  > utils/view.setSelectedChild view.id=[" + view.id +
									"] setting selectedChild to null with hash=[" + hash + "]");
							}
						}
					}.bind(this), true);
				this._boundEvents.push({
					"signal": signal
				});

				if (this.app.appLogging.logAll || this.app.appLogging.logViews) {
					this.setupAspectsForViews();
				}
			},

			dappinit: function () {
				if (this.app.appLogging.logAll) {
					console.log("> dapp-init fired for this.app.id=[" + this.app.id + "]");
				}
			},

			dappstatuschange: function (params) { // jshint maxcomplexity: 14
				// Note app.status = app.lifecycle.STARTING is done in Application.js on domReady, so this is too late for 1.
				var appId = params.app.id;
				var status = params.status;
				if (this.app.appLogging.logAll) {
					console.log("> dapp-status-change fired with status=[" + status + "] for params.app.id=[" +
						params.app.id + "]");
				}
				if (appId === this.app.id) {
					if (status === this.app.lifecycle.STARTED) {
						if (this.app.appLogging.logAll) {
							console.log(" > dapp/status fired with status for lifecycle.STARTED for app.id=[" +
								this.app.id + "]");
						}
						//Once the app is started we can add aspect before or after for methods in other controllers
						for (var i = 0; i < this.app.controllers.length; i++) {
							// log things from the load controller here
							if (this.app.appLogging.logAll || this.app.appLogging.LoadController) {
								if (this.app.controllers[i] === "dapp/controllers/delite/Load") {
									this.setupAspectsForLoadController(this.app.loadedControllers[i]);
								}
							}
							if (this.app.controllers[i] === "dapp/controllers/delite/Transition") {
								if (this.app.appLogging.logAll || this.app.appLogging.TransitionController) {
									this.setupAspectsForTransitionController(this.app.loadedControllers[i]);
								}
							}
						}
					}
					if (status === 4) { // STOPPED
						if (this.app.appLogging.logAll) {
							console.log(" > dapp/status fired with status for lifecycle.STOPPED for app.id=[" +
								this.app.id + "]");
						}
					}
				}
			},

			dappsetupviewstores: function (event) {
				if (this.app.appLogging.logAll) {
					console.log(" > dapp-setup-view-stores fired for [" + event.id + "] this.app.id=[" +
						this.app.id + "]");
				}
			},
			dappdisplay: function (event) {
				if (this.app.appLogging.logAll) {
					console.log("> dapp-display fired **NEW** dapp-display event with event.dest=[" +
						event.dest + "] this.app.id=[" + this.app.id + "]");
				}
			},
			delitedisplayload: function (event) {
				if (this.app.appLogging.logAll || this.app.appLogging.logDisplayLoad) {
					if (event.dapp) {
						console.log(" > delite-display-load fired with event.dest=[" + event.dest +
							"] event.dapp.parentView.id=[" + event.dapp.parentView.id + "] event.hide=[" +
							event.hide + "] this.app.id=[" + this.app.id + "]");

					} else {
						console.log("> delite-display-load fired no event.dapp with event.dest=[" + event.dest +
							"] event.hide=[" + event.hide + "] this.app.id=[" + this.app.id + "]");
					}
					if (event.loadDeferred) {
						event.loadDeferred.then(function (value) {
							console.log("  < back from delite-display-load resolveView with value.child.id=[" +
								value.child.id + "] value.dapp.parentView.id=[" +
								(value.dapp && value.dapp.parentView ? value.dapp.parentView.id : "") + "]");
						});
					}
				}
				var onbeforeDisplayHandle = event.target.on("delite-before-show, delite-before-hide", function (value) {
					// If the value.dest does not match the one we are expecting keep waiting
					if (value.dest !== event.dest) { // if this delite-after-show is not for this view return
						return;
					}
					onbeforeDisplayHandle.remove(); // remove the handle when we match value.dest
					if (this.app.appLogging.logAll) {
						console.log("  > " + value.type + " fired value.dest=[" + value.dest +
							"] event.dapp.parentView.id=[" + (event.dapp.parentView ? event.dapp.parentView.id : "") +
							"]");
					}
				}.bind(this));
				// on delite-after-show we will be ready to call afterDeactivate and afterActivate
				var onHandle = event.target.on("delite-after-show, delite-after-hide", function (value) {
					//var onHandle = on(event.target, "delite-after-show, , delite-after-hide", function (complete) {
					if (value.dest !== event.dest) { // if this delite-after-show is not for this view return
						return;
					}
					onHandle.remove();
					if (this.app.appLogging.logAll) {
						console.log("  > " + value.type + " fired value.dest=[" + value.dest +
							"] event.dapp.parentView.id=[" + (event.dapp.parentView ? event.dapp.parentView.id : "") +
							"]");
					}
				}.bind(this));
			},
			dappunloadview: function (event) {
				if (this.app.appLogging.logAll) {
					console.log(" > dapp-unload-view fired with event.view.id=[" + event.view.id +
						"] this.app.id=[" + this.app.id + "]");
				}
			},
			delitebeforeshow: function (event) {
				if (this.app.appLogging.logAll) {
					console.log("  > delite-before-show fired with event.view.id=[" + event.view.id +
						"] this.app.id=[" + this.app.id + "]");
				}
			},
			delitebeforehide: function (event) {
				if (this.app.appLogging.logAll) {
					console.log("  > delite-before-hide fired with event.view.id=[" + event.view.id +
						"] this.app.id=[" + this.app.id + "]");
				}
			},

			setupAspectsForViews: function () {
				var signal = aspect.before(ViewBase.prototype, "start",
					function () {
						console.log("  > dapp/ViewBase.start called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(View.prototype, "start",
					function () {
						console.log("  > dapp/View.start called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(View.prototype, "load",
					function () {
						console.log("  > dapp/View.load called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(ViewBase.prototype, "_loadViewController",
					function () {
						console.log("  > dapp/ViewBase._loadViewController called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(View.prototype, "_loadTemplate",
					function () {
						console.log("  > dapp/View._loadTemplate called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(View.prototype, "_startup",
					function () {
						console.log("  > dapp/View._startup called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(ViewBase.prototype, "_initViewHidden",
					function () {
						console.log("  > dapp/ViewBase._initViewHidden called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(ViewBase.prototype, "_startLayout",
					function () {
						console.log("  > dapp/ViewBase._startLayout called for [" + this.id + "]");
					});
				this._boundEvents.push({
					"signal": signal
				});
			},

			setupAspectsForLoadController: function (loadController) {
				var signal = aspect.before(loadController,
					"_handleBeforeDeactivateCalls", function (subs, next, current, data) { // jshint unused:false
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
					"signal": signal
				});
				signal = aspect.before(loadController, "_handleBeforeActivateCalls",
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
					"signal": signal
				});
				signal = aspect.before(loadController, "_handleAfterActivateCalls",
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
					"signal": signal
				});
				signal = aspect.before(loadController, "_handleAfterDeactivateCalls",
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
					"signal": signal
				});
			},

			setupAspectsForTransitionController: function (transitionController) {
				var signal = aspect.before(transitionController, "_handleMultipleViewParts",
					function (event) {
						console.log(" > Transition._handleMultipleViewParts called event.dest=[" + event.dest +
							"] and event.viewData=[" + event.viewData + "]");
					}, true);
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(transitionController, "_hideView",
					function (viewTarget, event, isParent, viewPath) { // jshint unused:false
						console.log(" > Transition._hideView called for viewTarget [" +
							viewTarget + "] with event.dest = [" + event.dest + "] ");
					}, true);
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(transitionController, "_displayView",
					function (viewTarget, event, isParent, viewPath) { // jshint unused:false
						console.log(" > Transition._displayView called for viewTarget [" +
							viewTarget + "] with event.dest = [" + event.dest + "] ");
					}, true);
				this._boundEvents.push({
					"signal": signal
				});
				signal = aspect.before(transitionController, "_displayParents",
					function (viewTarget, event, isParent, viewPath) { // jshint unused:false
						console.log(" > Transition._displayParents called for viewTarget [" +
							viewTarget + "]");
					}, true);
				this._boundEvents.push({
					"signal": signal
				});
			}
		});
	});
