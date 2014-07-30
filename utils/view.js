define(["dcl/dcl"], function (dcl) {
	var constraints = [];

	function getViewDefFromDest(app, viewPath) {
		if (viewPath) {
			var parts = viewPath.split(",");
			var viewDef = app;
			for (var item in parts) {
				viewDef = viewDef.views[parts[item]];
			}
			return viewDef;
		}
		return null;
	}

	function destIndexesOf( /*string*/ text, /*string*/ chars) {
		// summary:
		//		Searches the specified text for the first index of a character contained in the specified
		//		string of characters.
		// text: string
		// 		The text to search.
		// chars: string
		// 		The characters for which to search (any of these).
		// returns: {Number[]}
		//		The array of indexes at which one of the specified characters is found or an empty array
		// 		if not found.
		//
		if (!chars || (chars.length === 0)) {
			throw "One or more characters must be provided to search for characters: " + " chars=[ " +
				chars + " ], text=[ " + text + " ]";
		}
		var result = [];
		var index = 0;
		var current = null;
		for (index = 0; index < text.length; index++) {
			current = text.charAt(index);
			if (chars.indexOf(current) >= 0) {
				result.push(index);
			}
		}
		return result;
	}

	function destSplit( /*string*/ text, /*string*/ separators) {
		// summary:
		//		split the the specified text on separator characters
		// text: string
		// 		The text to split.
		// separators: string
		// 		The characters for which to split (any of these).
		// returns: {String[]}
		//		Return an array of string parts.
		//
		if (!separators || (separators.length === 0)) {
			separators = ",";
		}
		var result = [];
		var index = 0;
		var current = null;
		var start = 0;
		for (index = 0; index < text.length; index++) {
			current = text.charAt(index);
			if (separators.indexOf(current) >= 0) {
				if (start === index) {
					result.push("");
				} else {
					result.push(text.substring(start, index));
				}
				start = index + 1;
			}
		}
		if (start === text.length) {
			result.push("");
		} else {
			result.push(text.substring(start));
		}
		return result;
	}

	function _addDefaultViewsToPath(app, dest) {
		var viewPath = dest;
		var viewDef = getViewDefFromDest(app, dest);
		while (viewDef && viewDef.defaultView) {
			viewPath = viewPath + "," + viewDef.defaultView;
			viewDef = getViewDefFromDest(app, viewPath);
		}
		return viewPath;
	}

	return {
		getSelectedChild: function (view, constraint) {
			// summary:
			//		get current selected child according to the constraint
			//
			// view: View
			//		the View to get the child from
			// constraint: Object
			//		tbe constraint object
			//
			// returns:
			//		the selected child view for this constraint
			var type = typeof (constraint);
			var hash = (type === "string" || type === "number") ? constraint : constraint.__hash;
			return (view && view.selectedChildren && view.selectedChildren[hash]) ?
				view.selectedChildren[hash] : null;
		},

		getDefaultConstraint: function (viewId, parentNode) {
			// summary:
			//		get the default constraint based upon the parentNode, if it is a ViewStack (has
			// 		selectedChildId) the default constraint will be "center" otherwise it will be the viewId
			//
			// viewId: String
			//		the viewId of the view to get the default constraint for
			//
			// parentNode: domNode
			//		the parentNode of the view to get the default constraint for, if the parentNode has a
			// 		selectedChildId defined then the default constraint is "center" otherwise it is the viewId.
			//
			// returns:
			//		the default constraint for this view
			if (parentNode && parentNode.selectedChildId !== undefined) {
				return parentNode.id || "center";
			}
			return viewId ? viewId : parentNode ? parentNode.id : "center";
		},

		getConstraintForViewTarget: function (viewTarget, app) {
			// summary:
			//		get current selected child according to the constraint
			//
			// viewTarget: string
			//		the View to get the child from
			// constraint: Object
			//		tbe constraint object
			//
			// returns:
			//		the constraint for the viewTarget
			if (!viewTarget) {
				return null;
			}
			var parts = viewTarget.split(",");
			var child = app;
			//now we need to loop forwards thru parts to get to the child view
			for (var i = 0; i < parts.length; i++) {
				child = child.views[parts[i]];
			}
			if (child) {
				return child.constraint;
			} else {
				return null;
			}
		},

		setSelectedChild: function (view, constraint, child, app) {
			// summary:
			//		set current selected child according to the constraint
			//
			// view: View
			//		the View to set the selected child to
			// constraint: Object
			//		tbe constraint object
			// child: View
			//		the child to select
			var type = typeof (constraint);
			var hash = (type === "string" || type === "number") ? constraint : constraint.__hash;
			if (child) {
				if (!view.selectedChildren) { // view is a domNode, not a parentView
					view = this.getParentViewFromViewId(app, child.id);
				}
				view.selectedChildren[hash] = child;
				if (app.autoUnloadCount) {
					child.transitionCount = 0;
					// add code to bump the transitionCounter to see when to unload other child views
					for (var otherChildKey in view.children) {
						var otherChild = view.children[otherChildKey];
						var otherChildConstraint = otherChild.constraint;
						var childtype = typeof (otherChildConstraint);
						var childhash = (childtype === "string" || childtype === "number") ? otherChildConstraint :
							otherChildConstraint.__hash;
						if (hash === childhash && otherChild !== child) {
							otherChild.transitionCount++;
						}
					}
				}
			} else {
				view.selectedChildren[hash] = null;
			}

		},

		getAllSelectedChildren: function (view, selChildren) {
			// summary:
			//		get current all selected children for this view and it's selected subviews
			//
			// view: View
			//		the View to get the child from
			//
			// selChildren: Array
			//		the Array of the subChildren found
			//
			// returns:
			//		selChildren array of all of the selected child views
			//
			selChildren = selChildren || [];
			if (view && view.selectedChildren) {
				for (var hash in view.selectedChildren) {
					if (view.selectedChildren[hash]) {
						var subChild = view.selectedChildren[hash];
						selChildren.push(subChild);
						this.getAllSelectedChildren(subChild, selChildren);
					}
				}
			}
			return selChildren;
		},


		getViewFromViewId: function (app, viewId) {
			if (viewId) {
				var parts = viewId.split("_");
				var view = app;
				var nextChildId = "";
				for (var item in parts) {
					var childId = nextChildId + parts[item];
					view = view.children[childId];
					nextChildId = childId + "_";
				}
				return view;
			}
			return null;
		},

		_getViewPaths: function (app, viewPaths) {
			// summary:
			//		Extracts the views form the specified string and returns an array of objects.
			//		Each element in the array is a sibling or cousin view and in turn contains a lineage.
			//		The returned array takes the following form:
			//		[
			//			{ dest: "ViewName",
			//				remove: true|false,
			//				lineage: [ "ViewName", "ViewName", ... ]
			//			},
			//			{ dest: "viewDest",
			//				remove: true|false,
			//				lineage: [ "ViewName", "ViewName", ... ]
			//			},
			//			. . .
			//		]
			//
			if (viewPaths.trim().length <= 0) {
				return null;
			}
			var sepIndices = destIndexesOf(viewPaths, "+-");
			var siblings = destSplit(viewPaths, "+-");
			var result = [];
			var index = 0;
			var removes = [];
			var sepIndex = 0;
			var sep = "";
			for (index = 0; index < sepIndices.length; index++) {
				sepIndex = sepIndices[index];
				sep = viewPaths.charAt(sepIndex);
				removes.push(sep === "-" ? true : false);
			}
			if ((sepIndices.length > 0) && (sepIndices[0] === 0)) {
				// we begin with a separator so ignore first sibling
				// which should be empty-string
				siblings.shift();
			} else {
				// the first character is not a plus or minux, so assume
				// it is a plus by default so the first sibling is an add
				removes.unshift(false);
			}
			for (index = 0; index < siblings.length; index++) {
				var lastViewDef = getViewDefFromDest(app, siblings[index]) || {};
				if (!removes[index] && lastViewDef && lastViewDef.defaultView) {
					siblings[index] = _addDefaultViewsToPath(app, siblings[index]);
				}
				result.push({
					dest: siblings[index],
					remove: removes[index],
					lineage: destSplit(siblings[index], ","),
					loadViewsInOrder: lastViewDef.loadViewsInOrder,
					lastViewId: siblings[index].replace(/,/g, "_")
				});
			}
			return result;
		},

		getViewDestFromViewid: function (app, viewId) {
			if (viewId) {
				var parts = viewId.split("_");
				var viewDef = app;
				var viewName = "";
				for (var item in parts) {
					viewName = parts[item];
					viewDef = viewDef.views[parts[item]];
				}
				return viewName;
			}
			return viewId;
		},

		getViewDefFromViewId: function (app, viewId) {
			if (viewId) {
				var parts = viewId.split("_");
				var viewDef = app;
				for (var item in parts) {
					viewDef = viewDef.views[parts[item]];
				}
				return viewDef;
			}
			return null;
		},

		getViewIdFromEvent: function (app, event) {
			var dest = event.dest;
			var parentNode = event.target;
			var pViewId;
			if (event.dapp && event.dapp.parentView && event.dapp.parentView !== app) {
				pViewId = event.dapp.parentView.id + "_" + dest;
				return pViewId;
			}
			var pView = this.getParentViewFromViewName(app, dest, parentNode);
			if (!pView) { // this is not a dapp view
				return null;
			}
			if (app === pView) { // pView is the app
				return dest;
			}
			// check to see if the parent view has app dest as a child
			var vdef = this.getViewDefFromViewId(app, pView.id);
			if (vdef && vdef.views && vdef.views[dest]) {
				return pView.id + "_" + dest;
			}
			return dest;

		},

		getParentViewFromViewName: function (app, viewName, parentNode) {
			if (app.containerNode === parentNode) {
				return app;
			}
			var pNode = parentNode;
			while (!pNode.viewId && pNode.parentNode) {
				pNode = pNode.parentNode;
			}
			// found first parentView from parentNode, now check to see if this view is a child
			if (pNode && pNode.viewId) {
				var parentViewId = pNode.viewId;
				var pView = this.getViewFromViewId(app, parentViewId);
				while (pView !== app) {
					if (pView.views && pView.views[viewName]) {
						return pView;
					}
					pView = pView.parentView;
				}
			}
			if (!app.views[viewName]) {
				console.warn("Did not find parentView returning null for parentView for viewName = " + viewName);
				return null;
			}
			return app;
		},

		getParentViewFromViewId: function (app, viewId) {
			if (viewId) {
				var parts = viewId.split("_");
				parts.pop();
				var view = app;
				var nextChildId = "";
				for (var item in parts) {
					var childId = nextChildId + parts[item];
					view = view.children[childId];
					nextChildId = childId + "_";
				}
				return view;
			}
			return null;
		},

		getParamsForView: function (app, event) {
			// summary:
			//		Get view's params only include view specific params if they are for this view.
			//
			// app: Application
			//		the Application
			// event: Object
			//		the event for the transition
			//
			// returns:
			//		params Object for this view
			var viewId = event.dapp.id || this.getViewIdFromEvent(app, event);
			var parentView = event.dapp.parentView;
			var params = event.viewParams || "";
			var retParams = {};
			if (parentView && parentView !== app && parentView.viewParams) {
				dcl.mix(retParams, parentView.viewParams);
			}
			if (!params || !params.views && !retParams) { // do not modify params unless it has views specified
				return params;
			}

			var viewParams = this.getDataForView(app, viewId, parentView, params);
			dcl.mix(retParams, viewParams);
			return retParams;
		},

		getDataForView: function (app, viewId, parentView, data) {
			// summary:
			//		Get view's data only include view specific data if they are for this view.
			//
			// app: Application
			//		the Application
			// viewId: String
			//		the view's id
			// data: Object
			//		the data object which can contain views with view specific data
			//
			// returns:
			//		data Object for this view
			var retData = {};
			if (!data || !data.views) { // do not modify data unless it has views specified
				return data;
			}

			if (data) {
				if (data.views) {
					for (var item in data) {
						if (item !== "views") { // it is for specific views
							var value = data[item];
							// need to add these data for the view
							retData[item] = value;
						} else {
							for (var item2 in data.views) {
								var value2 = data.views[item2];
								var testId = viewId.replace(/_/g, ",");
								if (item2 === testId) { // it is for this view
									// need to add these data for the view
									dcl.mix(retData, value2);
									break;
								}
							}
						}
					}
				} else {
					dcl.mix(retData, data);
				}
			}
			return retData;
		},

		register: function (constraint) {
			// if the constraint has already been registered we don't care about it...
			var type = typeof (constraint);
			if (!constraint.__hash && type !== "string" && type !== "number") {
				var match = null;
				constraints.some(function (item) {
					var ok = true;
					for (var prop in item) {
						if (prop.charAt(0) !== "_") { //skip the private properties
							if (item[prop] !== constraint[prop]) {
								ok = false;
								break;
							}
						}
					}
					if (ok === true) {
						match = item;
					}
					return ok;
				});
				if (match) {
					constraint.__hash = match.__hash;
				} else {
					// create a new "hash"
					var hash = "";
					for (var prop in constraint) {
						if (prop.charAt(0) !== "_") {
							hash += constraint[prop];
						}
					}
					constraint.__hash = hash;
					constraints.push(constraint);
				}
			}
		}
	};
});
