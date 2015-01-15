define(
	["require", "dcl/dcl", "lie/dist/lie", "../Controller", "../utils/view"],
	function (require, dcl, Promise, Controller, viewUtils) {
		var app; // need app in closure for loadMapper
		return dcl(Controller, {
			constructor: function (newapp) {
				app = newapp;
			},

			_loadHandler: function (event) {
				event.preventDefault(); // to indicate that dapp will load the view
				// load the actual view

				event.loadPromise = new Promise(function (loadResolve) {
					event.loadResolve = loadResolve;
					//Need to handle calls directly from node.show or node.hide that did not come from transition
					if (!event.dapp || !event.dapp.parentView) {
						//This must be a direct call from .show or .hide, need to setup event.dapp with parentView etc.
						event.dapp = this._setupEventDapp(event);
						this._handleShowFromDispContainer(event, event.dapp.dest);
						return;
					}

					var viewId = event.dapp.parentView !== this.app ?
						(event.dapp.parentView.id + "_" + event.dest) : event.dest;

					// Check to see if this view has already been loaded
					var view = null;
					if (event.dapp.parentView && event.dapp.parentView.childViews) {
						view = event.dapp.parentView.childViews[viewId];
					}

					// if this is a hide for a view which is not loaded then do not process it
					if (event.dapp.hide && !view) {
						//console.log("Load._loadHandler called with hide true, but view is not available to remove");
						return; // trying to remove a view which is not showing
					}

					this._handleOnBeforeAndAfterShowHide(event);

					var viewParams = viewUtils.getParamsForView(this.app, event);

					if (view) {
						// set viewParams to new value before returning
						view.viewParams = viewParams || null;
						this._resolveView(event, view, event.dapp.parentView);
					} else {
						this._createView(event, viewId, event.dest, viewParams, event.dapp.parentView,
							event.dapp.parentNode, event.dapp.isParent, event.dapp.parentView.views[event.dest].type,
							event.dapp.viewPath);
					}
				}.bind(this));

				if (event.setChild) {
					event.setChild(event.loadPromise);
				}
			},

			_setupEventDapp: function (event) {
				var dest = event.dest;
				var viewId;
				if (typeof dest === "string") {
					if (dest.indexOf("_") >= 0) { // if dest is already a view id.
						viewId = dest;
						dest = viewUtils.getViewDestFromViewid(this.app, viewId);
					} else {
						viewId = viewUtils.getViewIdFromEvent(this.app, event);
					}
				}
				event.dapp = {};
				if (!viewId) {
					return event.dapp; // not a dapp view so nothing to setup in event.dapp
				}
				// setup dest with the full view path, add in defaultViews if necessary
				dest = viewId.replace(/_/g, ",");

				// Note at one point this code would not set callTransition = true for a single view but in that
				// case the history controller would not be notified of the transition, so it was changed to always
				// call Transition so the flag is no longer needed.
				if (event.hide) {
					dest = "-" + dest;
				}
				event.dapp.dest = dest;
				return event.dapp;
			},

			_handleShowFromDispContainer: function (event, dest) {
				if (!dest) { // this is not a dapp view, so it should be loaded, resolve it
					var child = document.getElementById(event.dest);
					event.loadResolve({
						child: child
					});
					return;
				}
				var savedloadResolve = event.loadResolve;
				new Promise(function (resolve) {
					this.app.emit("dapp-display", {
						dest: dest,
						transition: event.transition,
						reverse: event.reverse,
						displayResolve: resolve,
						bubbles: true,
						cancelable: true
					});
				}.bind(this)).then(function (value) {
					// resolve the loadDeferred here, do not need dapp stuff since we are not waiting on the
					// "delite-before-show" or "delite-after-show" it was handled already by the emit
					// for "dapp-display" above.
					savedloadResolve({ //
						child: value[0].child
					});
				});
				return;

			},

			_handleBeforeDeactivateCalls: function (subs, next, current, data) {
				// summary:
				//		Call beforeDeactivate for each of the current views which are about to be deactivated
				//now we need to loop backwards thru subs calling beforeDeactivate
				for (var i = subs.length - 1; i >= 0; i--) {
					var v = subs[i];
					if (v && v.beforeDeactivate && v._active) {
						var vdata = viewUtils.getDataForView(this.app, v.id, v.parentView, data);
						v.beforeDeactivate(next, vdata);
					}
				}
			},

			_handleBeforeActivateCalls: function (subs, current, data /*, subIds*/ ) {
				// summary:
				//		Call beforeActivate for each of the next views about to be activated
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
						//setup view data
						var vdata = viewUtils.getDataForView(this.app, v.id, v.parentView, data);
						v.beforeActivate(current, vdata);
					}
					if (p) {
						viewUtils.setSelectedChild(p, (v ? v.constraint :
							viewUtils.getDefaultConstraint(v.id, v.parentNode)), v, this.app);
					}
					p = v;
				}
			},

			_handleAfterDeactivateCalls: function (subs, next, current, data /*, subIds*/ ) {
				// summary:
				//		Call afterDeactivate for each of the current views which have been deactivated
				if (subs) {
					//now we need to loop forwards thru subs calling afterDeactivate
					for (var i = 0; i < subs.length; i++) {
						var v = subs[i];
						if (v && v.afterDeactivate && v._active) {
							v._active = false;
							var vdata = viewUtils.getDataForView(this.app, v.id, v.parentView, data);
							v.afterDeactivate(next, vdata);
						}
					}
				}
			},

			_handleAfterActivateCalls: function (subs, removeView, current, data) {
				// summary:
				//		Call afterActivate for each of the next views which have been activated
				//now we need to loop backwards thru subs calling beforeActivate (ok since next matches current)
				var startInt = 0;
				if (removeView && subs.length > 1) {
					startInt = 1;
				}
				for (var i = startInt; i < subs.length; i++) {
					var v = subs[i];
					if (v.afterActivate) {
						v._active = true;
						var vdata = viewUtils.getDataForView(this.app, v.id, v.parentView, data);
						v.afterActivate(current, vdata);
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
				var parts = [];
				var p = firstChildView || parentView;
				var nextSubViewArray = [p];
				if (subIds) {
					parts = subIds.split(",");
				} else {
					return nextSubViewArray;
				}
				var prevViewId = firstChildView.id;
				//now we need to loop forwards thru subIds calling beforeActivate
				for (var i = 0; i < parts.length; i++) {
					prevViewId = prevViewId + "_" + parts[i];
					var v = p.childViews[prevViewId];
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
				if (removeView && currentSubViewArray.length > 0) { // if we found one to remove also remove children
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
				// 		If a view has childViews loaded the view and any childViews of the view will be unloaded.
				//
				// example:
				//		Use trigger() to trigger "dapp-unload-view" event, and this function will response the event.
				// 		For example:
				//		|	this.trigger("dapp-unload-view", {"view":view, "callback":function(){...}});
				//
				// event: Object
				//		dapp-unload-view event parameter. It should be like this: {"view":view, "parent": parent
				// 		"callback":function(){...}}
				var view = event.view || {};
				var parentView = event.parentView || view.parent || this.app;
				var viewId = view.id;

				if (parentView && event.unloadApp) {
					// need to clear out selectedChildren
					parentView.selectedChildren = {};
				}
				if (parentView && !parentView.selectedChildren[viewId] &&
					(parentView.childViews[viewId] || event.unloadApp)) {

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
				// 		Destroy all childViews, destroy all widgets, destroy the domNode, remove the view from the
				// 		parentView.childViews, then destroy the view.
				//
				// parentView: Object
				//		parentView of this view.
				// viewToUnload: Object
				//		the view to be unloaded.
				for (var child in viewToUnload.childViews) {
					// unload childViews then unload the view itself
					this.unloadChild(viewToUnload, viewToUnload.childViews[child]);
				}
				var viewId = viewToUnload.id;
				if (viewToUnload.beforeDestroy) {
					viewToUnload.beforeDestroy(); // call beforeDestroy to handle any controller specific cleanup.
				}
				if (viewToUnload.destroy) {
					viewToUnload.destroy(); // call destroy for the view to destroy the widget and node.
				}
				viewToUnload = null;
				delete parentView.childViews[viewId]; // remove it from the parentViews childViews
			}
		});
	});
