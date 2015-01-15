define(
	["require", "dcl/dcl", "../LoadBase", "../../utils/view", "../../viewFactory"],
	function (require, dcl, LoadBase, viewUtils, viewFactory) {
		var app; // need app in closure for loadMapper
		var mapHandler;
		var resolveView = function (event, newView, parentView) {
			// in addition to arguments required by delite we pass our own needed arguments
			// to get them back in the transitionDeferred
			event.loadResolve({ // resolve
				child: newView,
				dapp: {
					nextView: newView,
					parentView: parentView,
					parentNode: event.dapp.parentNode,
					isParent: event.dapp.isParent,
					id: newView.id,
					viewName: newView.viewName,
					hide: event.dapp.hide,
					viewPath: event.dapp.viewPath
				}
			});
		};

		return dcl(LoadBase, {
			constructor: function (newapp) {
				app = newapp;
				this.events = {
					"delite-display-load": this._loadHandler.bind(this),
					"dapp-unload-view": this.unloadView.bind(this)
				};
				mapHandler = this.loadMapper.bind(this);
				this.mapEvents = [{
					evented: document,
					event: "delite-display-load",
					handler: mapHandler
				}];
				//document.addEventListener("delite-display-load", mapHandler, false);
				//document.addEventListener("delite-display-load", this._loadHandler.bind(this), false);
			},

			_resolveView: function (event, newView, parentView) {
				resolveView(event, newView, parentView);
			},

			loadMapper: function (event) {
				if (this.app.id !== app.id) {
					//TODO: rmove this warn
					console.warn("TEMP msg - mapping *** Wrong appId app.id=" + app.id + " this.app.id=" + this.app.id);
					return; // do not fire to the wrong application
				}
				app.emit("delite-display-load", event);
			},

			_handleOnBeforeAndAfterShowHide: function (event) {
				// After the loadResolve is resolved, but before the view is displayed this event,
				// delite-before-show will be fired.
				var self = this;
				if (!event.dapp.hide) {
					var onbeforeShowDisplayHandle = event.target.on("delite-before-show", function (value) {
						// This section of code to handle "delite-before-show" is complicated because if it is
						// for nested views the parent views and the child view will both be shown (if the parent
						// views are not already showing).  So the activate calls need to be made for all of the
						// parent and child views.
						//
						// If the value.dest does not match the one we are expecting keep waiting
						if (app !== self.app) { // if wrong app ignore the load request
							console.warn("onbeforeShowDisplayHandle called for the wrong application self.app.id=" +
								self.app.id + " value.dest=" + value.dest);
							return;
						}
						if (value.dest !== event.dest) { // if this delite-after-show is not for this view return
							return;
						}
						onbeforeShowDisplayHandle.remove(); // remove the handle when we match value.dest

						var retval = {};

						// If this is not a parent of a nested view, we need to determine the firstChildView, subIds and
						//  parentView in order to call _getNextSubViewArray, _handleBeforeDeactivateCalls and
						// _handleBeforeActivateCalls
						if (!value.dapp.isParent) {
							var firstChildId, subIds;
							retval.dapp = value.dapp;

							firstChildId = value.dapp.id;
							subIds = null;

							var viewTarget = value.dapp.nextView.id.replace(/_/g, ",");
							if (viewTarget && value.dapp.viewPath.lineage.length > 0) {
								var parts = value.dapp.viewPath.lineage;
								firstChildId = parts.shift();
								subIds = parts.join(",");
							}
							var appView = self.app;

							var firstChildView = appView.childViews[firstChildId] ||
								viewUtils.getViewFromViewId(appView, value.dapp.id); // may be nested

							var nextSubViewArray = self._getNextSubViewArray(subIds, firstChildView, appView);

							// Need to use viewUtils.getSelectedChild instead of event.target._visibleChild
							// because in a nested case where isParent is true we replace the event.target._visibleChild
							// before we are ready to use it.  We wait for !isParent and then process the views.
							var current = viewUtils.getSelectedChild(appView, (firstChildView &&
								firstChildView.constraint ? firstChildView.constraint :
								viewUtils.getDefaultConstraint(firstChildView.id, firstChildView.parentNode)));

							// use the nextSubViewArray to get the currentSubViewArray and current and next last child
							// matches.
							var currentSubViewRet = self._getCurrentSubViewArray(appView, nextSubViewArray,
								value.dapp.hide);
							var currentSubViewArray = currentSubViewRet.currentSubViewArray;
							self.currentLastSubChildMatch = currentSubViewRet.currentLastSubChildMatch;
							self.nextLastSubChildMatch = currentSubViewRet.nextLastSubChildMatch;

							//call _handleBeforeDeactivateCalls to process calls to beforeDeactivate for this transition
							if (currentSubViewArray) {
								self._handleBeforeDeactivateCalls(currentSubViewArray, self.nextLastSubChildMatch,
									current, value.viewData, subIds);
							}
							retval.dapp.nextSubViewArray = nextSubViewArray;
							retval.dapp.currentSubViewArray = currentSubViewArray;
							retval.dapp.nextLastSubChildMatch = self.nextLastSubChildMatch;
							retval.dapp.current = current;
							retval.dapp.viewPath = value.dapp.viewPath;
							retval.firstChildView = firstChildView;
							retval.subIds = subIds;

							//not hide so call _handleBeforeActivateCalls to process calls to beforeActivate
							self._handleBeforeActivateCalls(nextSubViewArray, self.currentLastSubChildMatch || current,
								value.viewData, subIds);
						}
						return retval;
					});
					// on delite-after-show we will be ready to call afterDeactivate and afterActivate
					var onafterShowDisplayHandle = event.target.on("delite-after-show", function (complete) {
						if (complete.dest !== event.dest) { // if this delite-after-show is not for this view return
							return;
						}
						onafterShowDisplayHandle.remove();

						var next = complete.dapp.nextView;

						// Add call to handleAfterDeactivate and _handleAfterActivateCalls here!

						// Call _handleAfterDeactivateCalls if !isParent (not parent part of a nested view)
						if (!complete.dapp.isParent) {
							self._handleAfterDeactivateCalls(complete.dapp.currentSubViewArray,
								complete.dapp.nextLastSubChildMatch || next, complete.dapp.current, complete.viewData,
								complete.subIds);
						}

						if (complete.dapp.nextSubViewArray && next) {
							self._handleAfterActivateCalls(complete.dapp.nextSubViewArray, /*removeView*/ false,
								complete.dapp.currentLastSubChildMatch || complete.dapp.current, complete.viewData,
								complete.subIds);
						}
					});
				}
				if (event.dapp.hide) {
					var onbeforeHideDisplayHandle = event.target.on("delite-before-hide", function (value) {
						// This section of code to handle "delite-before-hide" is not as complicated because for nested
						// views hiding a child view does not hide the parent views, so the deactivate calls are only
						// made for the child view.
						//
						// If the value.dest does not match the one we are expecting keep waiting
						if (value.dest !== event.dest) { // if this delite-before-hide is not for this view return
							return;
						}
						onbeforeHideDisplayHandle.remove(); // remove the handle when we match value.dest

						var retval = {};

						// If this is not a parent of a nested view, we need to determine the firstChildView, subIds and
						//  parentView in order to call _getNextSubViewArray, _handleBeforeDeactivateCalls and
						// _handleBeforeActivateCalls
						// Once you get the view, call beforeDeactivate like this
						var v = value.dapp.nextView;
						if (v && v.beforeDeactivate && v._active) {
							var vdata = viewUtils.getDataForView(self.app, v.id, value.dapp.parentView, value.viewData);
							v.beforeDeactivate(null, vdata); // pass null for next since it is being hidden
						}
						retval.dapp = value.dapp;
						retval.dapp.nextSubViewArray = null;
						retval.dapp.currentSubViewArray = null;
						retval.dapp.nextLastSubChildMatch = self.nextLastSubChildMatch;
						retval.dapp.current = v;
						retval.dapp.viewPath = value.dapp.viewPath;
						retval.firstChildView = v;
						retval.subIds = null;
						return retval;
					});
					// on delite-after-hide we will be ready to call afterDeactivate and afterActivate
					var onafterHideDisplayHandle = event.target.on("delite-after-hide", function (complete) {
						if (complete.dest !== event.dest) { // if this delite-after-hide is not for this view return
							return;
						}
						onafterHideDisplayHandle.remove();
						var v = complete.dapp.nextView;

						var parentSelChild = viewUtils.getSelectedChild(v.parentView,
							v.constraint);
						v.viewShowing = false;
						if (v === parentSelChild) {
							viewUtils.setSelectedChild(v.parentView,
								v.constraint, null, self.app); // remove from selectedChildren
						}

						if (v && v.afterDeactivate && v._active) {
							v._active = false;
							var vdata = viewUtils.getDataForView(self.app, v.id, complete.dapp.parentView,
								complete.viewData);
							v.afterDeactivate(null, vdata); // pass null for next since it is being hidden
						}
					});
				}
			},

			_createView: function (event, id, viewName, viewParams, parentView, parentNode, isParent, viewType,
				viewPath) {
				var app = this.app;
				var params = {
					"app": app,
					"id": id,
					"viewType": viewType,
					"viewName": viewName,
					"parentView": parentView,
					"parentNode": parentNode,
					"isParent": isParent,
					"viewPath": viewPath,
					"viewParams": viewParams
				};
				viewFactory(params).then(function (newView) {
					parentView.childViews[id] = newView;
					event.dapp.parentView = parentView;
					event.dapp.parentNode = newView.parentNode;
					event.dapp.isParent = isParent;
					event.dapp.viewPath = viewPath;
					resolveView(event, newView, parentView);
				});
			}
		});
	});
