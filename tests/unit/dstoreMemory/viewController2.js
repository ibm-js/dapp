// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register", "dstore/Memory", "dstore/Observable"],
	function (dom, on, register, MemoryStore, Observable) {
		return {
			name: "",
			lastSelection: "",
			_beforeActivateCallCount: 0,
			_beforeDeactivateCallCount: 0,
			_afterActivateCallCount: 0,
			_afterDeactivateCallCount: 0,
			init: function () {
				this.domNode.name = this.id;
				var list = this.domNode.ownerDocument.getElementById("list2");

				// Different options for creating the store, 1. MemoryStore, add data below
				//list.store = new MemoryStore();
				//for (i = 6; i < 11; i++) {
				//	list.store.add({label: "Selection " + i, id: i});
				//}
				// Different options for creating the store, 2. Use loadedStores from the config loadedStores.list2Store
				list.store = this.loadedStores.list2Store;

				// When the list is clicked, transition to dstoreMemoryAppHome2, pass the label of the selected item.
				on(this.domNode.ownerDocument.getElementById("list2"), "click",
					function ( /*MouseEvent*/ evt) {
						var label = evt.target.innerHTML || "";
						var params = {
							viewData: label
						};
						var targetView = "dstoreMemoryAppHome1";
						//	dstoreMemoryApp.displayView(targetView,{viewData:label)
						dstoreMemoryApp.displayView(targetView, params);
					}
				);

			},
			beforeActivate: function (previousView, viewData) {
				//console.log("app-view:", "beforeActivate called for [" + this.viewName +
				// "] with previousView.id =[" + (previousView ? previousView.id : "") + "] with viewData=", viewData);
				this._beforeActivateCallCount++;
				this.domNode.lastSelection = viewData ? viewData.label : "";
			},
			beforeDeactivate: function (nextView, viewData) {
				//console.log("app-view:", "beforeDeactivate called for [" + this.viewName +
				//	"] with previousView.id =[" + (nextView ? nextView.id : "") + "]");
				this._beforeDeactivateCallCount++;
			},
			afterActivate: function (previousView, viewData) {
				//console.log("app-view:", "afterActivate called for [" + this.viewName + "] with previousView.id =[" +
				//	(previousView ? previousView.id : "") + "] with viewData=", viewData);
				this._afterActivateCallCount++;
				//	this.app.emit("afterActivateCalled", {
				//		view: this
				//	});
			},
			afterDeactivate: function (nextView, viewData) {
				//console.log("app-view:", "afterDeactivate called for [" + this.viewName +
				// "] with previousView.id =[" + (nextView ? nextView.id : "") + "]");
				this._afterDeactivateCallCount++;
			},
			destroy: function () {
				//console.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
			}
		};
	});
