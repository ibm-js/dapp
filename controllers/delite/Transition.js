define(["dcl/dcl", "dojo/when", "dojo/Deferred", "dojo/promise/all", "../../Controller", "../../utils/viewUtils"],
	function (dcl, when, Deferred, all, Controller, viewUtils) {
		var MODULE = "controllers/delite/Transition:";

		// summary:
		//		A Transition controller to listen for "dapp-display" events and drive the transitions for those
		// 		events.
		// description:
		//		A Transition controller to listen for "dapp-display" events and drive the transitions for those
		// 		events.

		return dcl(Controller, {
			constructor: function (app) {
				// summary:
				//		add an event listener for "dapp-display" event, and
				//
				// app:
				//		dapp application instance.
				this.app = app;
				this.bind(document, "dapp-display", this._displayHandler.bind(this));
			},

			_getParentNode: function (subEvent) {
				var F = MODULE + "_getParentNode ";
				// subEvent.dapp.parentView is the view, the parentView.containerNode is the parentNode
				var viewDef = subEvent.dapp.parentView.views[subEvent.dest];
				var parentSelector = viewDef ? viewDef.parentSelector : null;
				var p = parentSelector ? this.app.domNode.querySelector(parentSelector) : null;
				if (!p) {
					p = subEvent.dapp.parentView.containerNode;
					if (parentSelector) {
						console.warn("Parent was not found with parentSelector=[" + parentSelector +
							"] for parentView with id=[" + subEvent.dapp.parentView.id + "]");
					}
				}

				this.app.log(MODULE, F + "parentSelector = [" + parentSelector + "] p.id=" + (p ? p.id : "") + "]");

				return p;
			},
			_displayHandler: function (event) {
				// summary:
				//		_displayHandler for "dapp-display" event.
				//
				// example:
				//		Use on.emit to trigger "dapp-display" event, and this function will respond to the event.
				// 		For example: on.emit(document, "dapp-display",
				// 					{bubbles: true, cancelable: true, dest: "viewName", transition: "slide"});
				//
				// event: Object
				//		"app-transition" event parameter. It should include dest, like: {"dest": viewId}
				var F = MODULE + "_displayHandler ";
				this.app.log(MODULE, F + "called **NEW** dapp-display event with event.dest=[" + event.dest + "]");
				var dest = event.dest;
				this._handleMultipleViewParts({
					dest: dest,
					viewData: event.viewData,
					reverse: event.reverse,
					transition: event.transition,
					displayDeferred: event.displayDeferred,
					dapp: {}
				});
			},

			_syncCallsToDisplayView: function (viewPaths, i, event, syncDef) {
				var F = MODULE + "_loadViewsInOrder ";
				var self = this;

				this.app.log(MODULE, F + "called with event.dest=[" + event.dest + "] and event.viewData=[" +
					event.viewData + "]");
				var displayViewPromise = (viewPaths[i].remove) ?
					this._hideView(viewPaths[i].dest, event, false, viewPaths[i]) :
					this._displayView(viewPaths[i].dest, event, false, viewPaths[i]);
				i++;
				if (i < viewPaths.length) { // need to wait before loading the next views.
					when(displayViewPromise, function () {
						displayViewPromise = self._syncCallsToDisplayView(viewPaths, i, event, syncDef);
					});
				} else {
					when(displayViewPromise, function (value) {
						syncDef.resolve(value);
					});
				}
				return syncDef.promise;

			},
			_loadViewsInOrder: function (viewPaths, i, event, syncDef) {
				var F = MODULE + "_loadViewsInOrder ";
				var self = this;
				this.app.log(MODULE, F + "called with event.dest=[" + event.dest + "] and event.viewData=[" +
					event.viewData + "]");
				var dispViewDef = (viewPaths[i].remove) ?
					this._hideView(viewPaths[i].dest, event, false, viewPaths[i]) :
					this._displayView(viewPaths[i].dest, event, false, viewPaths[i]);
				i++;
				if (i < viewPaths.length) { // need to wait before loading the next views.
					dispViewDef.then(function () {
						dispViewDef = self._loadViewsInOrder(viewPaths, i, event, syncDef);
					});
				} else {
					dispViewDef.then(function (value) {
						syncDef.resolve(value);
					});
				}
				return syncDef.promise;

			},

			_handleMultipleViewParts: function (event) {
				var F = MODULE + "_handleMultipleViewParts ";
				this.app.log(MODULE, F + "called with event.dest=[" + event.dest + "] and event.viewData=[" +
					event.viewData + "]");
				var defs = []; // list of deferreds that need to fire before I am complete

				var syncDeferred;
				//	var viewPaths = this.app._getViewPaths(event.dest);
				var viewPaths = viewUtils._getViewPaths(this.app, event.dest);
				var self = this;
				if (viewPaths) {
					if (this.app.loadViewsInOrder || viewPaths[0].loadViewsInOrder) {
						syncDeferred = new Deferred();
						defs.push(syncDeferred);
						this._loadViewsInOrder(viewPaths, 0, event, syncDeferred);
					} else {
						var i = 0;
						while (i < viewPaths.length) {
							var displayViewPromise = (viewPaths[i].remove) ?
								self._hideView(viewPaths[i].dest, event, false, viewPaths[i]) :
								self._displayView(viewPaths[i].dest, event, false, viewPaths[i]);
							defs.push(displayViewPromise);
							i++;
							// need to wait before loading the next views if loadViewsInOrder is set.
							if (i < viewPaths.length && viewPaths[i].loadViewsInOrder) {
								syncDeferred = new Deferred();
								defs.push(syncDeferred);
								displayViewPromise.then(function () {
									self._loadViewsInOrder(viewPaths, i, event, syncDeferred);
								});
								break;
							}
						}
					}
					// check for all defs being complete here, and resolve displayDeferred when all are resolved
					all(defs).then(function (value) {
						self.app.log(MODULE, F + "back from all(defs) for event.dest[" + event.dest + "]");
						if (event.displayDeferred) {
							event.displayDeferred.resolve(value);
						}
					});
				}
			},

			// _hideView is called to hide a view
			_hideView: function (viewTarget, event, isParent, viewPath) {
				var F = MODULE + "_hideView ";
				this.app.log(MODULE, F + "called for viewTarget [" + viewTarget + "] with event.dest = [" +
					event.dest + "] ");
				var deferred = new Deferred();
				event.dapp.isParent = isParent;
				event.dapp.hide = true;
				event.dapp.viewPath = viewPath;
				event.dapp.parentView = viewUtils.getParentViewFromViewId(this.app, viewPath.lastViewId);
				event.dest = event.dapp.parentView.children[viewPath.lastViewId].viewName;
				var self = this;
				var p = self._getParentNode(event);
				if (!p.hide) { // should have a hide function, if not
					//TODO: ELC need a test for this!!
					console.error("No hide function available on parentNode for viewTarget =" + viewTarget);
					event.dapp.nextView = event.dapp.parentView.children[viewTarget];
					var parentSelChild = viewUtils.getSelectedChild(event.dapp.parentView,
						event.dapp.nextView.constraint);
					event.dapp.nextView.viewShowing = false;
					if (event.dapp.nextView === parentSelChild) {
						viewUtils.setSelectedChild(event.dapp.parentView,
							event.dapp.nextView.constraint, null, self.app); // remove from selectedChildren
					}
					deferred.resolve(event);
				} else {
					p.hide(event.dapp.viewPath.lastViewId, event).then(function (value) {
						self.app.log(MODULE, F + "back from p.hide for event.dest[" +
							event.dest + "] event.dapp.parentView.id[" + event.dapp.parentView.id + "]");
						deferred.resolve(value);
						return value;
					});
				}
				return deferred.promise;
			},

			// _displayView is called to show a view, it will handle nested views by calling _displayParents
			_displayView: function (viewTarget, event, isParent, viewPath) {
				var F = MODULE + "_displayView ";
				this.app.log(MODULE, F + "called for viewTarget [" + viewTarget + "] with event.dest = [" +
					event.dest + "] ");
				var deferred = new Deferred();
				var subEvent;
				event.dapp.isParent = isParent;
				event.dapp.viewPath = viewPath;
				var self = this;
				// wait for parents to be displayed first
				when(this._displayParents(viewTarget, event, isParent, viewPath),
					function (value) {
						self.app.log(MODULE, F + "after _displayParents value.dapp.nextView.id=[" +
							(value.dapp.nextView ? value.dapp.nextView.id : "") + "]");
						subEvent = Object.create(event);
						subEvent.dest = viewTarget.split(",").pop();
						subEvent.dapp.viewPath = viewPath;
						subEvent.dapp.viewPath.dest = subEvent.dest;
						subEvent.dapp.isParent = isParent;
						self.app.log(MODULE, F + "subEvent.dest = [" + subEvent.dest + "]");

						subEvent.dapp.parentView = value.dapp.nextView;
						var p = self._getParentNode(subEvent);
						if (!p || !p.show) {
							console.warn((p ? ("Parent [" + p.id + "] does not have a show function!") :
								"Do not have a parent for [" + subEvent.dest + "]"));
							//TODO: need to test this!
							deferred.resolve(value);
							return;
						}
						subEvent.dapp.parentNode = p;
						self.app.log(MODULE, F + "before p.show with subEvent.dest = [" + subEvent.dest +
							"] with p.id=[" + p.id + "]");

						subEvent.target = p;
						var viewId = self.app === subEvent.dapp.parentView ? subEvent.dest :
							viewUtils.getViewIdFromEvent(self.app, subEvent);
						var viewdef = viewUtils.getViewDefFromViewId(self.app, viewId);
						var constraint = viewdef && viewdef.constraint ? viewdef.constraint : "center";
						var selView = viewUtils.getSelectedChild(subEvent.dapp.parentView, constraint);
						// if viewId is already the selected view set transition to none.
						if (selView && selView.id === viewId) {
							subEvent.transition = "none";
						}
						p.show(subEvent.dest, subEvent).then(function (value) {
							self.app.log(MODULE, F + "back from parent.containerNode.show for subEvent.dest[" +
								subEvent.dest + "] subEvent.dapp.parentView.id[" + subEvent.dapp.parentView.id + "]");
							deferred.resolve(value);
							return value;
						});
					});
				return deferred.promise;
			},

			// _displayParents is called to show parent views before showing the child view for nested views
			_displayParents: function (viewTarget, ev, isParent, viewPath) {
				var F = MODULE + "_displayParents ";
				this.app.log(MODULE, F + "called for viewTarget=[" + viewTarget + "]");
				// for now we consider the parents are listed in the display command (i.e. parent1,parent2,view)
				// TODO: we might improve that later to avoid users have to specify this?
				var parts = viewTarget ? viewTarget.split(",") : "";
				if (parts && parts.length > 1) {
					parts.pop(); // process the parent first
					var dest = parts.join(",");
					viewPath.dest = dest;
					this.app.log(MODULE, F + "calling return _displayView with dest=[", dest + "]");
					return this._displayView(dest, ev, true, viewPath);
				}
				return {
					dapp: {
						nextView: this.app,
						dest: ev.dest
					}
				};
			}
		});
	});