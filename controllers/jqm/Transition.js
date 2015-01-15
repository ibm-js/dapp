define(["dcl/dcl", "lie/dist/lie", "../TransitionBase", "../../utils/view",
		"jquery", "jquery.mobile"
	],
	function (dcl, Promise, TransitionBase, viewUtils, $) {

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
					p = subEvent.dapp.parentView.containerNode; // for jqm use the containerNode
					if (parentSelector) {
						console.warn("Parent was not found with parentSelector=[" + parentSelector +
							"] for parentView with id=[" + subEvent.dapp.parentView.id + "]");
					}
				} else if (p && p.getAttribute("data-role") !== "page") {
					//TODO: need to test this!
					console.warn("Parent found with parentSelector=[" + parentSelector +
						"] does not have a child with a data-role of page for parentView with id=[" +
						subEvent.dapp.parentView.id + "]");
					p = this.app.containerNode;
				}

				return p;
			},

			// _hideView is called to hide a view
			_hideView: function (viewTarget, event, isParent, viewPath) {
				return new Promise(function (resolve) {
					event.dapp.isParent = isParent;
					event.dapp.hide = true;
					event.dapp.viewPath = viewPath;
					event.dapp.parentView = viewUtils.getParentViewFromViewId(this.app, viewPath.lastViewId);
					event.dest = event.dapp.parentView.childViews[viewPath.lastViewId].viewName;
					//var p = self._getParentNode(event) || document.body; // added document.body for jqm
					//TODO: can we verify that the correct transition has occurred? maybe we assume it for JQM page
					//$(":mobile-pagecontainer").pagecontainer("change", "", event);
					$.mobile.pageContainer.pagecontainer("change", "", event);
					$(document).one("pagecontainertransition", function (complete, ui) {
						//$(document).one("pagecontainershow", function (complete, ui) {
						resolve(ui.options);
						return ui.options;
					}.bind(this));
				}.bind(this));
			},

			// _parentIsValid is called to see if p is valid and handle it if it is not
			_parentIsValid: function (p, dest) {
				if (!p) {
					console.warn("Do not have a parent for [" + dest + "]");
					//TODO: need to test this!
					return false;
				}
				return true;
			},

			// _showView is called to make the final call to show the view
			_showView: function (p, subEvent) {
				return new Promise(function (resolve) {
					//$(":mobile-pagecontainer").pagecontainer("change", subEvent.dest, subEvent);
					// body does not work, it is not the right div, it is not the pageContainer
					//$( "body" ).pagecontainer( "change", subEvent.dest, subEvent);
					$.mobile.pageContainer.pagecontainer("change", subEvent.dest, subEvent);
					$(document).one("pagecontainertransition", function (complete, ui) {
						//$(document).one("pagecontainershow", function (complete, ui) {
						resolve(ui.options);
						return ui.options;
					});
				});
			}
		});
	});
