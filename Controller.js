define(["dcl/dcl", "dojo/_base/lang", "dojo/on"], function (dcl, lang, on) {
	// module:
	//		dapp/Controller
	// summary:
	//		Bind events on dapp application's dojo/Evented instance or document.

	return dcl(null, {
		constructor: function (app, events) {
			// summary:
			//		bind events on application dojo/Evented instance.
			//		bind css selector events on document.
			//

			// app:
			//		dapp application instance.
			// events:
			//		{event : handler}

			this.events = this.events || events;
			this._boundEvents = [];
			this.app = app;
		},

		bind: function (evented, event, handler) {
			// summary:
			//		Bind event on dojo/Evented instance, document, domNode or window.
			//		Save event signal in controller instance. If no parameter is provided
			//		automatically bind all events registered in controller events property.
			//
			// evented: Object
			//		dojo/Evented instance, document, domNode or window
			// event: String
			//		event
			// handler: Function
			//		event handler
			if (arguments.length === 0) {
				if (this.events) {
					for (var item in this.events) {
						if (item.charAt(0) !== "_") {//skip the private properties
							this.bind(this.app, item, lang.hitch(this, this.events[item]));
						}
					}
				}
			} else {
				var signal = on(evented, event, handler);
				this._boundEvents.push({
					"event": event,
					"evented": evented,
					"signal": signal
				});
			}
			return this;
		},

		unbind: function (evented, event) {
			// summary:
			//		remove a binded event signal.
			//
			// evented: Object
			//		dojo/Evented instance, document, domNode or window
			// event: String
			//		event

			var len = this._boundEvents.length;
			for (var i = 0; i < len; i++) {
				if ((this._boundEvents[i].event === event) && (this._boundEvents[i].evented === evented)) {
					this._boundEvents[i].signal.remove();
					this._boundEvents.splice(i, 1);
					return;
				}
			}
			console.warn("event '" + event + "' not bind on ", evented);
			return this;
		}
	});
});
