define(["dcl/dcl", "requirejs-dplugins/Promise!", "../Controller", "../utils/view"],
	function (dcl, Promise, Controller, viewUtils) {

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
				this.events = {
					"dapp-display": this._displayHandler.bind(this)
				};
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
				var dest = event.dest;
				var hash = event.hash;
				this._handleMultipleViewParts({
					dest: dest,
					hash: hash,
					viewData: event.viewData,
					reverse: event.reverse,
					transition: event.transition,
					displayResolve: event.displayResolve,
					doingPopState: event.doingPopState,
					viewParams: event.viewParams,
					dapp: {}
				});
			},

			_loadViewsInOrder: function (viewPaths, i, event) {
				var self = this;
				var dispViewDef = (viewPaths[i].remove) ?
					this._hideView(viewPaths[i].dest, event, false, viewPaths[i]) :
					this._displayView(viewPaths[i].dest, event, false, viewPaths[i]);
				i++;
				if (i < viewPaths.length) { // need to wait before loading the next views.
					return dispViewDef.then(function () {
						return self._loadViewsInOrder(viewPaths, i, event);
					});
				} else {
					return dispViewDef;
				}
			},

			_handleMultipleViewParts: function (event) {
				var promises = []; // list of Promises that need to fire before I am complete
				var viewPaths = viewUtils._getViewPaths(this.app, event.dest);
				var self = this;
				if (viewPaths) {
					if (this.app.loadViewsInOrder || viewPaths[0].loadViewsInOrder) {
						promises.push(this._loadViewsInOrder(viewPaths, 0, event));
					} else {
						var i = 0;
						while (i < viewPaths.length) {
							var displayViewPromise = (viewPaths[i].remove) ?
								self._hideView(viewPaths[i].dest, event, false, viewPaths[i]) :
								self._displayView(viewPaths[i].dest, event, false, viewPaths[i]);
							promises.push(displayViewPromise);
							i++;
							// need to wait before loading the next views if loadViewsInOrder is set.
							if (i < viewPaths.length && viewPaths[i].loadViewsInOrder) {
								promises.push(displayViewPromise.then(function () {
									return self._loadViewsInOrder(viewPaths, i, event);
								}));
								break;
							}
						}
					}
					// check for all promises being complete here, and resolve displayResolve when all are resolved
					Promise.all(promises).then(function (value) {
						//	event.detail = {
						//		"dest": event.dest,
						//		"hash": event.hash,
						//		"viewData": event.viewData,
						//		"viewParams": event.viewParams,
						//		"transition": event.transition
						//	};
						self.app.emit("dapp-finished-transition", event);
						if (event.displayResolve) {
							event.displayResolve(value);
						}
					});
				}
			},

			// _displayView is called to show a view, it will handle nested views by calling _displayParents
			_displayView: function (viewTarget, event, isParent, viewPath) {
				var subEvent;
				event.dapp.isParent = isParent;
				event.dapp.viewPath = viewPath;
				// wait for parents to be displayed first
				return Promise.resolve(this._displayParents(viewTarget, event,
					isParent, viewPath)).then(function (value) {
					subEvent = Object.create(event);
					subEvent.dest = viewTarget.split(",").pop();
					subEvent.dapp.viewPath = viewPath;
					subEvent.dapp.viewPath.dest = subEvent.dest;
					subEvent.dapp.isParent = isParent;

					subEvent.dapp.parentView = value.dapp.nextView;
					var p = this._getParentNode(subEvent) || document.body;
					if (!this._parentIsValid(p, subEvent.dest)) {
						console.warn("Invalid parent for [" + subEvent.dest + "]");
						return value;
					}
					subEvent.dapp.parentNode = p;

					subEvent.target = p;
					var viewId = this.app === subEvent.dapp.parentView ? subEvent.dest :
						viewUtils.getViewIdFromEvent(this.app, subEvent);
					var viewdef = viewUtils.getViewDefFromViewId(this.app, viewId);
					var constraint = viewdef && viewdef.constraint ? viewdef.constraint :
						viewUtils.getDefaultConstraint(viewId, p);
					var selView = viewUtils.getSelectedChild(subEvent.dapp.parentView, constraint);
					// if viewId is already the selected view set transition to none.
					if (selView && selView.id === viewId) {
						subEvent.transition = "none";
					}
					return this._showView(p, subEvent);
				}.bind(this));
			},

			// _displayParents is called to show parent views before showing the child view for nested views
			_displayParents: function (viewTarget, ev, isParent, viewPath) {
				// for now we consider the parents are listed in the display command (i.e. parent1,parent2,view)
				// TODO: we might improve that later to avoid users have to specify this?
				var parts = viewTarget ? viewTarget.split(",") : "";
				if (parts && parts.length > 1) {
					parts.pop(); // process the parent first
					var dest = parts.join(",");
					viewPath.dest = dest;
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
