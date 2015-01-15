define(["require", "dcl/dcl", "lie/dist/lie"],
	function (require, dcl, Promise) {
		return function (viewParams) {
			var viewType = viewParams.viewType;
			return new Promise(function (resolve) {
				require([viewType ? viewType : "./View"], function (View) {
					var v = new View(viewParams);
					if (v.start) {
						v.start().then(function (newView) {
							//TODO: is this needed
							if (newView.domNode) {
								newView = newView.domNode;
							}
							resolve(newView);
						});
					} else {
						var newView = v;
						resolve(newView);
					}
				});
			}.bind(this));
		};
	});
