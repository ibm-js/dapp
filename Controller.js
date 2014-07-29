define(["dcl/dcl"], function (dcl) {
	// module:
	//		dapp/Controller
	// summary:
	//		Bind events on dapp application's dojo/Evented instance or document.
	return dcl(null, {
		constructor: function (newapp) {
			// summary:
			//		bind events on application
			//

			// app:
			//		dapp application instance.
			// events:
			//		{event : handler}

			this._boundEvents = [];
			this.app = newapp;
			this.app.on("dapp-unload-app", this._unloadApp.bind(this));
		},

		_unloadApp: function () {
			this.unbindAll(); // remove all bound events
		},

		bindAll: function () {
			// summary:
			//		Bind all event on the application instance.
			//		Save event signal in controller instance.
			//
			if (this.events) {
				for (var item in this.events) {
					if (item.charAt(0) !== "_") { //skip the private properties
						var signal = this.app.on(item, this.events[item]);
						this._boundEvents.push({
							"event": item,
							"evented": this.app,
							"signal": signal
						});
					}
				}
			}
			if (this.mapEvents) {
				for (var mapItem in this.mapEvents) {
					if (mapItem.charAt(0) !== "_") { //skip the private properties
						var mapItem2 = this.mapEvents[mapItem];
						mapItem2.evented.addEventListener(mapItem2.event, mapItem2.handler, false);
					}
				}
			}
			return this;
		},

		unbindAll: function () {
			// summary:
			//		call signal.destroy to remove all event listeners.
			//

			var len = this._boundEvents.length;
			for (var i = 0; i < len; i++) {
				this._boundEvents[i].signal.destroy();
			}
			this._boundEvents = [];
			if (this.mapEvents) {
				for (var item in this.mapEvents) {
					if (item.charAt(0) !== "_") { //skip the private properties
						var mapItem = this.mapEvents[item];
						mapItem.evented.removeEventListener(mapItem.event, mapItem.handler);
					}
				}
			}
			return this;
		}
	});
});
