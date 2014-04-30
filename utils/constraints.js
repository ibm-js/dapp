define(["dojo/_base/array"], function (arr) {
	var constraints = [];
	var MODULE = "utils/constraints:";
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

		/* jshint maxcomplexity: 10 */
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
			var F = MODULE + "setSelectedChild ";
			var type = typeof (constraint);
			var hash = (type === "string" || type === "number") ? constraint : constraint.__hash;
			if (child) {
				app.log(MODULE, F + "view.id [" + view.id + "] has selectedChildren set for [" +
					child.id + "] with hash =[" + hash + "]");
				if (!view.selectedChildren) { // view is a domNode, not a parentView
					view = app.getParentViewFromViewId(child.id);
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
							app.log(MODULE, F + "otherChild.transitionCount for view [" +
								otherChildKey + "] =[" + otherChild.transitionCount + "]");
						}
					}
				}
			} else {
				app.log(MODULE, F + "view.id [" + view.id + "] has selectedChildren set with hash =[" + hash + "]");
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

		register: function (constraint) {
			// if the constraint has already been registered we don't care about it...
			var type = typeof (constraint);
			if (!constraint.__hash && type !== "string" && type !== "number") {
				var match = null;
				arr.some(constraints, function (item) {
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
