define(["require", "dojo/when", "dcl/dcl", "dojo/Deferred"],
	function (require, when, dcl, Deferred) {
		return function (viewParams) {
			var viewType = viewParams.viewType;
			var createDef = new Deferred();
			require([viewType ? viewType : "./View"], function (View) {
				var v = new View(viewParams);
				if (v.start) {
					v.start().then(function (newView) {
						//ELC TRY THIS:
						if (newView.domNode) {
							newView = newView.domNode;
						}
						createDef.resolve(newView);
					});
				} else {
					var newView = v;
					createDef.resolve(newView);
				}
			});
			return createDef;
		};
	});
