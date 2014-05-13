define(
	["require", "dcl/dcl", "dojo/on", "dojo/Deferred", "../../Controller",
		"../../utils/viewUtils"
	],
	function (require, dcl, on, Deferred, Controller, viewUtils) {
		var MODULE = "controllers/delite/Load:";
		var resolveView = function (event, newView, parentView) {
			// in addition to arguments required by delite we pass our own needed arguments
			// to get them back in the transitionDeferred
			var F = MODULE + "resolveView ";
			if (newView && newView.app) {
				newView.app.log(MODULE, F + "called with nextView.id=[" + newView.id +
					"] " + "parentView.id=[" + (parentView ? parentView.id : "") + "]");
			}
			event.loadDeferred.resolve({
				child: newView.domNode,
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

		return dcl(Controller, {
			constructor: function () {
				this.bind(document, "delite-display-load", this._loadHandler.bind(this));
				this.events = {
					"dapp-unload-view": this.unloadView
				};
			},

			_loadHandler: function (event) {
				var F = MODULE + "_loadHandler ";
				this.app.log(MODULE, F + "called for event.dest=[" + event.dest + "] event.hide=[" + event.hide +
					"] this.app.id=" + this.app.id);
				var self = this;
				event.preventDefault();

				// load the actual view

				//Need to handle calls directly from node.show or node.hide that did not come from transition
				if (!event.dapp || !event.dapp.parentView) {
					//This must be a direct call from .show or .hide, need to setup event.dapp with parentView etc.
					event.dapp = this._setupEventDapp(event);
					if (event.dapp.callTransition) {
						this._handleShowFromDispContainer(event, event.dapp.dest);
						return;
					}
				}

				var viewId = event.dapp.parentView !== this.app ?
					(event.dapp.parentView.id + "_" + event.dest) : event.dest;

				// Check to see if this view has already been loaded
				var view = null;
				if (event.dapp.parentView && event.dapp.parentView.children) {
					view = event.dapp.parentView.children[viewId];
				}

				// if this is a hide for a view which is not loaded then do not process it
				if (event.dapp.hide && !view) {
					self.app.log(F + " called with hide true, but that view is not available to remove");
					return; // trying to remove a view which is not showing
				}

				this._handleOnBeforeAndAfterShowHide(event);

				var params = event.params || "";

				if (view) {
					self.app.log(MODULE, F + "view already loaded view.id=" + view.id);
					// set params to new value before returning
					view.params = params || null;
					resolveView(event, view, event.dapp.parentView);
				} else {
					this._createView(event, viewId, event.dest, params, event.dapp.parentView,
						event.dapp.isParent, event.dapp.parentView.views[event.dest].type, event.dapp.viewPath);
				}
			},

			_setupEventDapp: function (event) {
				var F = MODULE + "_setupEventDapp ";
				var self = this;
				var dest = event.dest;
				var viewId;
				if (dest.indexOf("_") >= 0) { // if dest is already a view id.
					viewId = dest;
					dest = viewUtils.getViewDestFromViewid(this.app, viewId);
				} else {
					viewId = viewUtils.getViewIdFromEvent(this.app, event);
				}

				// setup dest with the full view path, add in defaultViews if necessary
				dest = viewId.replace(/_/g, ",");
				event.dapp = {};

				// if dest without defaults added is already nested call _handleShowFromDispContainer
				if (dest.indexOf("+") >= 0 || dest.indexOf("-") >= 0 || dest.indexOf(",") >= 0) {
					self.app.log(MODULE, F + "original dest contains +- or , need to handle special case dest=[" +
						dest + "]");
					if (event.hide) {
						dest = "-" + dest;
					}
					event.dapp.callTransition = true;
					event.dapp.dest = dest;
					//	this._handleShowFromDispContainer(event, dest);
					return event.dapp;
				}
				//	var viewPaths = this.app._getViewPaths(dest);
				var viewPaths = viewUtils._getViewPaths(this.app, dest);
				event.dest = viewPaths[0].dest;
				if (event.hide) {
					dest = "-" + dest;
				}
				// if viewPaths have multiple parts or dest and defaults is nested call _handleShowFromDispContainer
				if (viewPaths.length > 1 || event.dest.indexOf(",") >= 0) {
					self.app.log(MODULE, F + "dest contains multiple parts need to handle special case dest=[" +
						dest + "]");
					event.dapp.callTransition = true;
					event.dapp.dest = dest;
					//	this._handleShowFromDispContainer(event, dest);
					return event.dapp;
				}
				// Can process this direct call to .show or .hide since it is not multipart or nested
				event.dapp.parentNode = event.target;
				event.dapp.viewPath = viewPaths[0]; // viewPaths[0]
				event.dapp.parentView = viewUtils.getParentViewFromViewName(this.app, dest, event.target);
				this.app.log(MODULE, F + "in .show path after update event.dapp.parentView.id = " +
					event.dapp.parentView.id);
				event.dapp.isParent = false;
				return event.dapp;
			},

			_handleOnBeforeAndAfterShowHide: function (event) {
				// After the loadDeferred is resolved, but before the view is displayed this event,
				// delite-before-show will be fired.
				//var onbeforeDisplayHandle = on(event.target, "delite-before-show", function (value) {
				var F = MODULE + "_handleOnBeforeAndAfterShowHide ";
				var self = this;
				var onbeforeDisplayHandle = event.target.on("delite-before-show, delite-before-hide", function (value) {
					// If the value.dest does not match the one we are expecting keep waiting
					if (value.dest !== event.dest) { // if this delite-after-show is not for this view return
						return;
					}
					onbeforeDisplayHandle.remove(); // remove the handle when we match value.dest
					self.app.log(MODULE, F + "in on delite-before-show or hide value.dest =[" + value.dest + "]");

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
						if (viewTarget) {
							var parts = value.dapp.viewPath.lineage;
							firstChildId = parts.shift();
							subIds = parts.join(",");
						}
						var appView = self.app;

						var firstChildView = appView.children[firstChildId];

						var nextSubViewArray = [firstChildView || appView];
						if (subIds) {
							nextSubViewArray = self._getNextSubViewArray(subIds, firstChildView, appView);
						}

						// Need to use viewUtils.getSelectedChild instead of event.target._visibleChild
						// because in a nested case where isParent is true we replace the event.target._visibleChild
						// before we are ready to use it.  We wait for !isParent and then process the views.
						var current = viewUtils.getSelectedChild(appView, (firstChildView &&
							firstChildView.constraint ? firstChildView.constraint : "center"));

						// use the nextSubViewArray to get the currentSubViewArray and current and next last child
						// matches.
						var currentSubViewRet = self._getCurrentSubViewArray(appView, nextSubViewArray,
							value.dapp.hide);
						var currentSubViewArray = currentSubViewRet.currentSubViewArray;
						self.currentLastSubChildMatch = currentSubViewRet.currentLastSubChildMatch;
						self.nextLastSubChildMatch = currentSubViewRet.nextLastSubChildMatch;

						//call _handleBeforeDeactivateCalls to process calls to beforeDeactivate for this transition
						if (currentSubViewArray) {
							self._handleBeforeDeactivateCalls(currentSubViewArray, self.nextLastSubChildMatch, current,
								value.viewData, subIds);
						}
						retval.dapp.nextSubViewArray = nextSubViewArray;
						retval.dapp.currentSubViewArray = currentSubViewArray;
						retval.dapp.nextLastSubChildMatch = self.nextLastSubChildMatch;
						retval.dapp.current = current;
						retval.dapp.viewPath = value.dapp.viewPath;
						retval.firstChildView = firstChildView;
						retval.subIds = subIds;
						self.app.log(MODULE, F + "retval.firstChildView.id = [" + retval.firstChildView.id +
							"] retval.dapp.current.id = [" + "] retval.subIds = [" + retval.subIds + "]");

						if (!value.hide) {
							//call _handleBeforeActivateCalls to process calls to beforeActivate for this transition
							self._handleBeforeActivateCalls(nextSubViewArray, self.currentLastSubChildMatch || current,
								value.viewData, subIds);
						}
					}
					return retval;
				});
				// on delite-after-show we will be ready to call afterDeactivate and afterActivate
				var onHandle = event.target.on("delite-after-show, delite-after-hide", function (complete) {
					//var onHandle = on(event.target, "delite-after-show, , delite-after-hide", function (complete) {
					if (complete.dest !== event.dest) { // if this delite-after-show is not for this view return
						return;
					}
					self.app.log(MODULE, F + "in on delite-after-show complete.dest =[" + complete.dest + "]");
					onHandle.remove();

					var next = complete.dapp.nextView;
					//	self.app.log(MODULE, F + "delite-after-show fired for [" + next.id + "] with parent [" +
					//		(complete.dapp.parentView ? complete.dapp.parentView.id : "") + "]");

					if (complete.hide) {
						var parentSelChild = viewUtils.getSelectedChild(next.parentView,
							next.constraint);
						next.viewShowing = false;
						if (next === parentSelChild) {
							viewUtils.setSelectedChild(next.parentView,
								next.constraint, null, self.app); // remove from selectedChildren
						}
					}

					// Add call to handleAfterDeactivate and handleAfterActivate here!

					// Call _handleAfterDeactivateCalls if !isParent (not parent part of a nested view)
					if (!complete.dapp.isParent) {
						self.app.log(MODULE, F + "calling _handleAfterDeactivateCalls next id=[" + next.id +
							"] next.parentView.id=[" + next.parentView.id + "]");
						self._handleAfterDeactivateCalls(complete.dapp.currentSubViewArray,
							complete.dapp.nextLastSubChildMatch || next, complete.dapp.current, complete.viewData,
							complete.subIds);
					}

					if (!complete.hide && complete.dapp.nextSubViewArray && next) {
						self.app.log(MODULE, F + "calling _handleAfterActivateCalls next id=[" + next.id +
							"] next.parentView.id=[" + next.parentView.id + "]");
						self._handleAfterActivateCalls(complete.dapp.nextSubViewArray, /*removeView*/ false,
							complete.dapp.currentLastSubChildMatch || complete.dapp.current, complete.viewData,
							complete.subIds);
					}
				});
			},

			_handleShowFromDispContainer: function (event, dest) {
				//	var F = MODULE + "_handleShowFromDispContainer ";
				//	adjusted dest contains + - or , so need to handle specialcase dest
				var tempDisplaydeferred = new Deferred();
				on.emit(document, "dapp-display", {
					dest: dest,
					displayDeferred: tempDisplaydeferred,
					bubbles: true,
					cancelable: true
				});
				tempDisplaydeferred.then(function (value) {
					// resolve the loadDeferred here, do not need dapp stuff since we are not waiting on the
					// "delite-before-show" or "delite-after-show" it was handled already by the emit
					// for "dapp-display" above.
					event.loadDeferred.resolve({
						child: value[0].child
					});
				});
				return;

			},

			_createView: function (event, id, viewName, params, parentView, isParent, type, viewPath) {
				var F = MODULE + "_createView ";
				this.app.log(MODULE, F + "called for [" + id + "] with event.dapp.isParent=" +
					(event.dapp ? event.dapp.isParent : ""));
				var app = this.app;
				require([type ? type : "../../View"], function (View) {
					var params = {
						"app": app,
						"id": id,
						"viewName": viewName,
						"parentView": parentView,
						"parentNode": event.dapp.parentNode,
						"isParent": isParent,
						"viewPath": viewPath
					};
					dcl.mix(params, {
						"params": params
					});
					new View(params).start().then(function (newView) {
						parentView.children[id] = newView;
						event.dapp.parentView = parentView;
						event.dapp.parentNode = newView.parentNode;
						event.dapp.isParent = isParent;
						event.dapp.viewPath = viewPath;
						resolveView(event, newView, parentView);
					});
				});
			},

			_handleBeforeDeactivateCalls: function (subs, next, current, data) {
				// summary:
				//		Call beforeDeactivate for each of the current views which are about to be deactivated
				var F = MODULE + "_handleBeforeDeactivateCalls ";
				//	if(current._active){
				//now we need to loop backwards thru subs calling beforeDeactivate
				for (var i = subs.length - 1; i >= 0; i--) {
					var v = subs[i];
					this.app.log(MODULE, F + "in _handleBeforeDeactivateCalls in subs for v.id=[" + v.id + "]" +
						" v.beforeDeactivate isFunction?=[" +
						(typeof v.beforeDeactivate === "function") + "] v._active=[" + v._active + "]");
					if (v && v.beforeDeactivate && v._active) {
						this.app.log(MODULE, F + "beforeDeactivate for v.id=[" + v.id + "]");
						v.beforeDeactivate(next, data);
					}
				}
			},

			_handleBeforeActivateCalls: function (subs, current, data /*, subIds*/ ) {
				// summary:
				//		Call beforeActivate for each of the next views about to be activated
				var F = MODULE + "_handleBeforeActivateCalls ";
				//now we need to loop backwards thru subs calling beforeActivate (ok since next matches current)
				var p = this.app;
				for (var i = subs.length - 1; i >= 0; i--) {
					var v = subs[i];
					if (!v.beforeActivate) {
						v = viewUtils.getViewFromViewId(this.app, v.id);
					}
					if (!v.initialized) {
						v.initialized = true;
						v.init();
					}
					if (v && v.beforeActivate) {
						this.app.log(MODULE, F + "beforeActivate for v.id=[" + v.id + "]");
						v.beforeActivate(current, data);
					}
					if (p) {
						viewUtils.setSelectedChild(p, (v ? v.constraint : "center"), v, this.app);
					}
					p = v;
				}
			},

			_handleAfterDeactivateCalls: function (subs, next, current, data /*, subIds*/ ) {
				// summary:
				//		Call afterDeactivate for each of the current views which have been deactivated
				var F = MODULE + "_handleAfterDeactivateCalls ";
				this.app.log(MODULE, F + "afterDeactivate called for subs=", subs);
				if (subs) {
					//now we need to loop forwards thru subs calling afterDeactivate
					for (var i = 0; i < subs.length; i++) {
						var v = subs[i];
						this.app.log(MODULE, F + "afterDeactivate called with v.id=[" + v.id + "]");
						if (v && v.beforeDeactivate && v._active) {
							this.app.log(MODULE, F + "afterDeactivate for v.id=[" + v.id + "] setting _active false");
							v._active = false;
							v.afterDeactivate(next, data);
						}
					}
				}
			},

			_handleAfterActivateCalls: function (subs, removeView, current, data /*, subIds*/ ) {
				// summary:
				//		Call afterActivate for each of the next views which have been activated
				var F = MODULE + "_handleAfterActivateCalls ";
				//now we need to loop backwards thru subs calling beforeActivate (ok since next matches current)
				this.app.log(MODULE, F + "in _handleAfterActivateCalls with subs =", subs);
				var startInt = 0;
				if (removeView && subs.length > 1) {
					startInt = 1;
				}
				for (var i = startInt; i < subs.length; i++) {
					var v = subs[i];
					this.app.log(MODULE, F + "afterActivate for v.id=[" + v.id + "] and v.afterActivate isFunction=" +
						(typeof v.afterActivate === "function"));
					if (v.afterActivate) {
						this.app.log(MODULE, F + "afterActivate for v.id=[" + v.id + "] setting _active true");
						v._active = true;
						v.afterActivate(current, data);
					}
				}
			},

			_getNextSubViewArray: function (subIds, firstChildView, parentView) {
				// summary:
				//		Get next sub view array, this array will hold the views which are about to be transitioned to
				//
				// subIds: String
				//		the subids, the views are separated with a comma
				// firstChildView: Object
				//		the firstChildView view to be transitioned to.
				// parentView: Object
				//		the parent view used in place of firstChildView if firstChildView is not set.
				//
				// returns:
				//		Array of views which will be transitioned to during this transition
				var F = MODULE + "_getNextSubViewArray ";
				this.app.log(MODULE, F + "in _getNextSubViewArray with subIds =", subIds);
				var parts = [];
				var p = firstChildView || parentView;
				if (subIds) {
					parts = subIds.split(",");
				}
				var nextSubViewArray = [p];
				var prevViewId = firstChildView.id;
				//now we need to loop forwards thru subIds calling beforeActivate
				for (var i = 0; i < parts.length; i++) {
					prevViewId = prevViewId + "_" + parts[i];
					var v = p.children[prevViewId];
					if (v) {
						nextSubViewArray.push(v);
						p = v;
					}
				}
				nextSubViewArray.reverse();
				return nextSubViewArray;
			},

			_getCurrentSubViewArray: function (parentView, nextSubViewArray, removeView) {
				// summary:
				//		Get current sub view array which will be replaced by the views in the nextSubViewArray
				//
				// parent: String
				//		the parent view whose selected children will be replaced
				// nextSubViewArray: Array
				//		the array of views which are to be transitioned to.
				//
				// returns:
				//		Array of views which will be deactivated during this transition
				var F = MODULE + "_getCurrentSubViewArray ";
				this.app.log(MODULE, F + "in _getNextSubViewArray with parentView.id =", parentView.id);
				var currentSubViewArray = [];
				var constraint, type, hash;
				var p = parentView;
				var currentLastSubChildMatch = null;
				var nextLastSubChildMatch = null;

				for (var i = nextSubViewArray.length - 1; i >= 0; i--) {
					if (nextSubViewArray[i].constraint) {
						constraint = nextSubViewArray[i].constraint;
					} else {
						var v = viewUtils.getViewFromViewId(this.app, nextSubViewArray[i].id);
						constraint = v.constraint;
					}

					//constraint = nextSubViewArray[i].constraint || nextSubViewArray[i].parentView.id;
					type = typeof (constraint);
					hash = (type === "string" || type === "number") ? constraint : constraint.__hash;
					// if there is a selected child for this constraint, and the child matches this view, push it.
					if (p && p.selectedChildren && p.selectedChildren[hash]) {
						if (p.selectedChildren[hash] === nextSubViewArray[i]) {
							currentLastSubChildMatch = p.selectedChildren[hash];
							nextLastSubChildMatch = nextSubViewArray[i];
							currentSubViewArray.push(currentLastSubChildMatch);
							p = currentLastSubChildMatch;
						} else {
							currentLastSubChildMatch = p.selectedChildren[hash];
							currentSubViewArray.push(currentLastSubChildMatch);
							// setting this means the transition will be done to the child instead of the parentView
							nextLastSubChildMatch = nextSubViewArray[i];
							// since the constraint was set, but it did not match, need to deactivate all selected
							// children of this.currentLastSubChildMatch
							if (!removeView) {
								var selChildren = viewUtils.getAllSelectedChildren(currentLastSubChildMatch);
								currentSubViewArray = currentSubViewArray.concat(selChildren);
							}
							break;
						}
					} else { // the else is for the constraint not matching which means no more to deactivate.
						currentLastSubChildMatch = null; // there was no view selected for this constraint
						// set this to the next view for transition to an empty constraint
						nextLastSubChildMatch = nextSubViewArray[i];
						break;
					}

				}
				// Here since they had the constraint but it was not the same I need to deactivate all children of p
				if (removeView) {
					currentSubViewArray = currentSubViewArray.concat(viewUtils.getAllSelectedChildren(p));
				}
				//	for (var i = 0; i <= currentSubViewArray.length - 1; i++) {
				//		console.log(F + "returning  currentSubViewArray with currentSubViewArray[i].id = [" +
				// 			currentSubViewArray[i].id + "]");
				//	}
				var ret = {
					currentSubViewArray: currentSubViewArray,
					currentLastSubChildMatch: currentLastSubChildMatch,
					nextLastSubChildMatch: nextLastSubChildMatch
				};
				return ret;
			},

			unloadView: function (event) {
				// summary:
				//		Response to dapp "unload-view" event.
				// 		If a view has children loaded the view and any children of the view will be unloaded.
				//
				// example:
				//		Use trigger() to trigger "dapp-unload-view" event, and this function will response the event.
				// 		For example:
				//		|	this.trigger("dapp-unload-view", {"view":view, "callback":function(){...}});
				//
				// event: Object
				//		dapp-unload-view event parameter. It should be like this: {"view":view, "parent": parent
				// 		"callback":function(){...}}
				var F = MODULE + ":unloadView";

				var view = event.view || {};
				var parentView = event.parentView || view.parent || this.app;
				var viewId = view.id;
				this.app.log(MODULE, F + " dapp-unload-view called for [" + viewId + "]");

				if (parentView && event.unloadApp) {
					// need to clear out selectedChildren
					parentView.selectedChildren = {};
				}
				if (parentView && !parentView.selectedChildren[viewId] &&
					(parentView.children[viewId] || event.unloadApp)) {

					this.unloadChild(parentView, view);
					if (event.callback) {
						event.callback();
					}
				} else {
					console.warn("unload-view event called for view which could not be unloaded for viewId = " +
						viewId + ".");
				}
			},

			unloadChild: function (parentView, viewToUnload) {
				// summary:
				//		Unload the view, and all of its child views recursively.
				// 		Destroy all children, destroy all widgets, destroy the domNode, remove the view from the
				// 		parentView.children, then destroy the view.
				//
				// parentView: Object
				//		parentView of this view.
				// viewToUnload: Object
				//		the view to be unloaded.
				var F = MODULE + ":unloadChild";
				this.app.log(MODULE, F + " unloadChild called for [" + viewToUnload.id + "]");

				for (var child in viewToUnload.children) {
					this.app.log(MODULE, F + " calling unloadChild for for [" + child + "]");
					// unload children then unload the view itself
					this.unloadChild(viewToUnload, viewToUnload.children[child]);
				}
				// the viewToUnload.domNode is owned by viewToUnload so it will be destroyed when viewToUnload is.
				//TODO: the call to viewToUnload.destroy() can cause an error during destroy for the view if the view
				// controller does not have a destroy method
				var viewId = viewToUnload.id;
				if (viewToUnload.destroy) {
					this.app.log(MODULE, F + " calling destroy for the view [" + viewId + "]");
					viewToUnload.destroy(); // call destroy for the view.
				}
				viewToUnload = null;
				delete parentView.children[viewId]; // remove it from the parentViews children
			}
		});
	});
