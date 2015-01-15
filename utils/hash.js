define(function () {

	// module:
	//		dapp/utils/hash


	function foundView(prevChar, afterChar) {
		var retVal = false;
		if ((prevChar === "#" ||
				prevChar === "+" ||
				prevChar === "," ||
				prevChar === "(") && (afterChar === "&" ||
				afterChar === "+" ||
				afterChar === "-" ||
				afterChar === "," ||
				afterChar === "")) {
			retVal = true;
		}
		return retVal;
	}

	var hashUtil = {
		// summary:
		//		This module contains the hash

		getViewParams: function ( /*String*/ hash) {
			// summary:
			//		get the viewParams from the hash
			//
			// hash: String
			//		the url hash
			//
			// returns:
			//		the viewParams object
			//
			var viewParams;
			if (hash && hash.length) {

				while (hash.indexOf("(") > 0) {
					var index = hash.indexOf("(");
					var endindex = hash.indexOf(")");
					var viewPart = hash.substring(index, endindex + 1);
					if (viewPart.lastIndexOf("(") > 0) {
						index = index + viewPart.lastIndexOf("(");
						viewPart = hash.substring(index, endindex + 1);
					} else if (hash.charAt(index - 1) === ",") { // a child view
						var parentPart = hash.substring(0, index - 1);
						for (var ind = parentPart.length - 1; ind > 0; ind--) {
							var current = parentPart.charAt(ind);
							if (current === "+" || current === "," || current === "#") {
								viewPart = hash.substring(ind, index) + viewPart;
								break;
							}
						}
					}

					if (!viewParams) {
						viewParams = {};
					}
					var viewName = hashUtil.getViewNameFromViewPart(viewPart, index);

					viewParams = hashUtil.getParamObj(viewParams, viewPart, viewName);
					// next need to remove the viewPart from the hash, and look for the next one
					hash = hash.replace(viewPart, viewName);
				}
				// after all of the viewParts need to get the params for all views
				viewParams = hashUtil.getParamsForAllViews(viewParams, hash);

			}
			return viewParams; // Object
		},

		getViewNameFromViewPart: function (viewPart, index) {
			var viewName = viewPart.substring(1, viewPart.indexOf("&"));
			if (viewName.indexOf("(") > 0) {
				var index2 = viewName.indexOf("(");
				var newviewName = viewName.substring(0, index2) + viewName.substring(index + 1,
					viewName.length);
				viewName = newviewName;
			}
			return viewName;
		},

		getParamsForAllViews: function (viewParams, hash) {
			for (var parts = hash.split("&"), x = 0; x < parts.length; x++) {
				var tp = parts[x].split("="),
					name = tp[0],
					value = encodeURIComponent(tp[1] || "");
				if (name && value) {
					if (!viewParams) {
						viewParams = {};
					}
					viewParams[name] = value;
				}
			}
			return viewParams;
		},

		getViewPart: function (hash, index, endindex) {
			var viewPart = hash.substring(index, endindex + 1);
			if (viewPart.lastIndexOf("(") > 0) {
				index = index + viewPart.lastIndexOf("(");
				viewPart = hash.substring(index, endindex + 1);
			} else if (hash.charAt(index - 1) === ",") { // a child view
				var parentPart = hash.substring(0, index - 1);
				for (var ind = parentPart.length - 1; ind > 0; ind--) {
					var current = parentPart.charAt(ind);
					if (current === "+" || current === "," || current === "#") {
						viewPart = hash.substring(ind, index) + viewPart;
						break;
					}
				}
			}
		},
		getParamObj: function ( /*Object*/ viewParams, /*String*/ viewPart, /*String*/ viewName) {
			// summary:
			//		called to handle a view specific viewParams object
			// viewParams: Object
			//		the view specific viewParams object
			// viewPart: String
			//		the part of the view with the viewParams for the view
			// viewName: String
			//		the name of the view with the viewParams
			//
			// returns:
			//		the viewParams object for the view
			//
			var viewparams;
			var hash = viewPart.substring(viewPart.indexOf("&"), viewPart.length - 1);
			for (var parts = hash.split("&"), x = 0; x < parts.length; x++) {
				var tp = parts[x].split("="),
					name = tp[0],
					value = encodeURIComponent(tp[1] || "");
				if (name && value) {
					if (!viewparams) {
						viewparams = {};
					}
					viewparams[name] = value;
				}
			}
			viewParams.views = viewParams.views || {};
			viewParams.views[viewName] = viewparams;
			return viewParams; // Object
		},

		buildWithViewParams: function ( /*String*/ hash, /*Object*/ params) {
			// summary:
			//		build up the url hash adding the params
			// hash: String
			//		the url hash
			// params: Object
			//		the params object
			//
			// returns:
			//		the params object
			//
			if (hash.charAt(0) !== "#") {
				hash = "#" + hash;
			}
			for (var item in params) {
				var pvalue = params[item];
				if (item === "views") {
					for (var item2 in pvalue) {
						var value = pvalue[item2];
						// add a check to see if the params includes a view name if so setup the hash
						if (value !== undefined && typeof value === "object") {
							hash = hashUtil.addViewParams(hash, item2, value);
						}
					}
				} else if (typeof pvalue !== "object") {
					hash = hash + "&" + item + "=" + pvalue;
				}
			}
			return hash; // String
		},

		addViewParams: function ( /*String*/ hash, /*String*/ view, /*Object*/ params) {
			// summary:
			//		add the view specific params to the hash for example (view1&param1=value1)
			// hash: String
			//		the url hash
			// view: String
			//		the view name
			// params: Object
			//		the params for this view
			//
			// returns:
			//		the hash string
			//
			if (hash.charAt(0) !== "#") {
				hash = "#" + hash;
			}
			var index = hash.indexOf(view);
			if (index < 0) { // view not found maybe it is a nested view with a parent param?
				var viewChildIndex = view.lastIndexOf(",");
				var viewChild = view.substring(viewChildIndex, view.length);
				var childIndex = hash.indexOf(viewChild) + 1;
				index = childIndex;
				view = viewChild.substring(1, viewChild.length);
			}
			if (index > 0) { // found the view?
				// assume it is the view? or could check the char after for + or & or -
				if (foundView(hash.charAt(index - 1), hash.charAt(index + view.length))) {
					// found the view at this index.
					var oldView = hash.substring(index - 1, index + view.length + 1);
					var paramString = hashUtil.getParamString(params);
					if (paramString) {
						var newView = hash.charAt(index - 1) + "(" + view + paramString + ")" +
							hash.charAt(index + view.length);
						hash = hash.replace(oldView, newView);
					}
				}
			} else {
				console.error("in Hash addViewParams viewId not found in hash for view=" + view);
			}

			return hash; // String
		},

		getParamString: function ( /*Object*/ params) {
			// summary:
			//		return the param string
			// params: Object
			//		the params object
			//
			// returns:
			//		the params string
			//
			var paramStr = "";
			for (var item in params) {
				var value = params[item];
				if (item && value != null && typeof params[item] !== "object") {
					paramStr = paramStr + "&" + item + "=" + params[item];
				}
			}
			return paramStr; // String
		},

		getAllSelectedChildrenHash: function (view, selChildren, subChildFlag) {
			// summary:
			//		get current all selected children for this view and it's selected subviews
			//
			// view: View
			//		the View to get the child from
			//
			// returns:
			//		string with all of the selChildren added
			//
			selChildren = selChildren ? selChildren : "";
			if (view && view.selectedChildren) {
				for (var hash in view.selectedChildren) {
					if (view.selectedChildren[hash]) {
						var subChild = view.selectedChildren[hash];
						if (selChildren.length === 0) {
							selChildren = subChild.viewName;
						} else if (subChildFlag) {
							selChildren = selChildren + "," + subChild.viewName;
						} else {
							selChildren = selChildren + "+" + subChild.viewName;
						}
						var subChildren2 = hashUtil.getAllSelectedChildrenHash(subChild, selChildren, true);
						selChildren = subChildren2;
					}
				}
			}
			return selChildren;
		},


		getTarget: function ( /*String*/ hash, /*String?*/ defaultView) {
			// summary:
			//		return the target string
			// hash: String
			//		the hash string
			// defaultView: String
			//		the optional defaultView string
			//
			// returns:
			//		the target string
			//
			if (!defaultView) {
				defaultView = "";
			}
			while (hash.indexOf("(") > 0) {
				var index = hash.indexOf("(");
				var endindex = hash.indexOf(")");
				var viewPart = hash.substring(index, endindex + 1);
				var viewName = viewPart.substring(1, viewPart.indexOf("&"));
				hash = hash.replace(viewPart, viewName);
			}

			return (((hash && hash.charAt(0) === "#") ? hash.substr(1) : hash) || defaultView).split("&")[0]; // String
		}
	};

	return hashUtil;

});
