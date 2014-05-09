// jshint unused:false, undef:false, quotmark:false
define(["dojo/dom", "dojo/on", "delite/register", "dstore/Memory", "dstore/Observable", "dojo/_base/declare"],
	function (dom, on, register, MemoryStore, Observable, declare) {
		return {
			attributes: {
				name: "",
				lastSelection: ""
			},
			beforeActivateCallCount: 0,
			beforeDeactivateCallCount: 0,
			afterActivateCallCount: 0,
			afterDeactivateCallCount: 0,
			constructor: function (params) { // jshint unused:false
				//TODO: why is this not being hit?
				this.app.log("app-view:", " in [" + this.viewName + "] constructor called for [" + this.id + "]");
				var tempName = "";
			},
			init: function () {
				this.domNode.name = this.id;
				var list = this.domNode.ownerDocument.getElementById("list2");

				// Different options for creating the store, 1. ObservableStore, add data below
				//var ObservableMemoryStore = declare([MemoryStore, Observable], {});
				//list.store = new ObservableMemoryStore();
				// Different options for creating the store, 2. MemoryStore, add data below
				//list.store = new MemoryStore();
				//for (i = 1; i < 6; i++) {
				//	list.store.add({label: "Selection " + i, id: i});
				//}
				// Different options for creating the store, 3. Use loadedStores from the config loadedStores.list2Store
				list.store = this.loadedStores.list2Store;

				// When the list is clicked, transition to dStore1AppHome2, pass the label of the selected item.
				on(this.domNode.ownerDocument.getElementById("list2"), "click",
					function ( /*MouseEvent*/ evt) {
						var label = evt.target.innerHTML || "";
						var params = {
							viewData: label
						};
						var targetView = "dStore1AppHome1";
						//	dStore1App.displayView(targetView,{viewData:label)
						dStore1App.displayView(targetView, params);
					}
				);

			},
			beforeActivate: function (previousView, viewData) {
				this.app.log("app-view:", "beforeActivate called for [" + this.viewName + "] with previousView.id =[" +
					(previousView ? previousView.id : "") + "] with viewData=", viewData);
				this.beforeActivateCallCount++;
				this.domNode.lastSelection = viewData || "";
			},
			beforeDeactivate: function (nextView, viewData) {
				this.app.log("app-view:", "beforeDeactivate called for [" + this.viewName +
					"] with previousView.id =[" + (nextView ? nextView.id : "") + "]");
				this.beforeDeactivateCallCount++;
			},
			afterActivate: function (previousView, viewData) {
				this.app.log("app-view:", "afterActivate called for [" + this.viewName + "] with previousView.id =[" +
					(previousView ? previousView.id : "") + "] with viewData=", viewData);
				this.afterActivateCallCount++;
				//	this.app.emit("afterActivateCalled", {
				//		view: this
				//	});
			},
			afterDeactivate: function (nextView, viewData) {
				this.app.log("app-view:", "afterDeactivate called for [" + this.viewName + "] with previousView.id =[" +
					(nextView ? nextView.id : "") + "]");
				this.afterDeactivateCallCount++;
			},
			destroy: function () {
				this.app.log("app-view:", " in [" + this.viewName + "] destroy called for [" + this.id + "]");
			}
		};
	});
