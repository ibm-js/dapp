define(["dcl/dcl", "dojo/when", "dojo/Deferred", "dojo/promise/all", "../TransitionBase", "../../utils/view"],
	function (dcl, when, Deferred, all, TransitionBase, viewUtils) {

		// summary:
		//		A Transition controller to listen for "dapp-display" events and drive the transitions for those
		// 		events.
		// description:
		//		A Transition controller to listen for "dapp-display" events and drive the transitions for those
		// 		events.

		return dcl(TransitionBase, {
			_getParentNode: function (subEvent) {
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

				return p;
			},
			// _hideView is called to hide a view
			_hideView: function (viewTarget, event, isParent, viewPath) {
				var deferred = new Deferred();
				event.dapp.isParent = isParent;
				event.dapp.hide = true;
				event.dapp.viewPath = viewPath;
				event.dapp.parentView = viewUtils.getParentViewFromViewId(this.app, viewPath.lastViewId);
				event.dest = event.dapp.parentView.childViews[viewPath.lastViewId].viewName;
				var self = this;
				var p = self._getParentNode(event);
				if (!p.hide) { // should have a hide function, if not
					//TODO: need a test for this!!
					console.warn("No hide function available on parentNode for viewTarget =" + viewTarget);
					event.dapp.nextView = event.dapp.parentView.childViews[viewTarget];
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
						deferred.resolve(value);
						return value;
					});
				}
				return deferred.promise;
			},

			// _parentIsValid is called to see if p is valid and handle it if it is not
			_parentIsValid: function (p, dest, deferred, value) {
				if (!p || !p.show) {
					console.warn((p ? ("Parent [" + p.id + "] does not have a show function!") :
						"Do not have a parent for [" + dest + "]"));
					//TODO: need to test this!
					deferred.resolve(value);
					return false;
				}
				return true;
			},

			// _showView is called to make the final call to show the view
			_showView: function (p, subEvent, deferred) {
				p.show(subEvent.dest, subEvent).then(function (value) {
					deferred.resolve(value);
					return value;
				});
			}
		});
	});
