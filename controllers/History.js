define(["require", "dcl/dcl", "../utils/view",
		"../utils/hash", "../Controller"
	],
	function (require, dcl, viewUtils, hash, Controller) {
		var app;
		var mapperHandle;
		return dcl(Controller, {
			// _currentPosition:     Integer
			//              Persistent variable which indicates the current position/index in the history
			//              (so as to be able to figure out whether the popState event was triggerd by
			//              a backward or forward action).
			_currentPosition: 0,

			// currentState: Object
			//              Current state
			currentState: {},

			constructor: function (newapp) {
				app = newapp;
				this.events = {
					"popstate": this.onPopState.bind(this),
					"dapp-finished-transition": this.finishedTransition.bind(this)
				};
				mapperHandle = this.popstateMapper.bind(this);
				this.mapEvents = [{
					evented: window,
					event: "popstate",
					handler: mapperHandle
				}];
			},

			popstateMapper: function (event) {
				if (this.app.id !== app.id) {
					//TODO: rmove this warn
					console.warn("TEMP msg - mapping *** Wrong appId history app.id=" + app.id + " this.app.id=" +
						this.app.id);
					return; // do not fire to the wrong application
				}
				app.emit("popstate", event);
			},

			finishedTransition: function (evt) {
				// summary:
				//		Response to dojox/app "startTransition" event.
				//
				// example:
				//		|	event = {
				//		|		"dest": event.dest,
				//		|		"hash": event.hash,
				//		|		"viewData": event.viewData,
				//		|		"viewParams": event.viewParams,
				//		|		"transition": event.transition
				//		|	};
				//		|	on.emit(document, "dapp-finished-transition", event);
				//
				// evt: Object
				//		Transition options parameter
				// if not doing a popState then setup the currentHash and call pushState with it.
				if (evt && evt.doingPopState) { // when doingPopState do not pushState.
					return;
				}
				//var currentHash = window.location.hash;
				var evtdetail = {
					"dest": evt.dest,
					"hash": evt.hash,
					"viewParams": evt.viewParams,
					"viewData": evt.viewData,
					"transition": evt.transition,
					"reverse": evt.reverse
				};

				// Create a new "current state" history entry
				this._currentPosition += 1;
				evtdetail.id = this._currentPosition;

				var newDest = hash.getAllSelectedChildrenHash(this.app, "");
				var newHash = evtdetail.hash || "#" + newDest;
				if (newHash.charAt(0) !== "#") {
					newHash = "#" + newHash;
				}
				evtdetail.dest = newDest; // replace dest with the dest for all selected children

				if (evtdetail.viewParams) { // if there are viewParams add them to the hash
					newHash = hash.buildWithViewParams(newHash, evtdetail.viewParams);
				}

				if (this.app.hideUrlHash) {
					newHash = " "; // if hideUrlHash is true blank the hash in the url
				}

				evtdetail.fwdTransition = evtdetail.transition;
				history.pushState(evtdetail, evtdetail.href, newHash);
				this.currentState = Object.create(evtdetail);

				// Finally: Publish pushState topic
				this.app.emit("dapp-pushState", evtdetail);
			},

			onPopState: function (evt) {
				// summary:
				//		Response to dojox/app "popstate" event.
				//
				// evt: Object
				//		Transition options parameter

				// Clean browser's cache and refresh the current page will trigger popState event,
				// but in this situation the application has not started and throws an error.
				// So we need to check application status, if application not STARTED, do nothing.
				if ((this.app.status !== this.app.STARTED) || !evt.state) {
					return;
				}

				var state = evt.state;
				if (!state) {
					if (window.location.hash) {
						state = {
							target: hash.getTarget(location.hash),
							hash: location.hash,
							viewParams: hash.getViewParams(location.hash)
						};
					} else {
						state = {
							target: this.app.defaultView
						};
					}
				}

				// Get direction of navigation and update _currentPosition accordingly
				var backward = evt.state.id < this._currentPosition;
				backward ? this._currentPosition -= 1 : this._currentPosition += 1;

				//Need to compare evt.state.dest and this.currentState.dest to see if anything needs to be removed
				var removeDest = this.getViewsToRemoveFromDest(evt.state.dest, this.currentState.dest);
				var newDest = evt.state.dest;
				if (removeDest) {
					newDest = removeDest + "+" + newDest;
				}

				this.currentState = Object.create(evt.state);
				// Publish popState topic and transition to the target view.
				var opts = {
					bubbles: true,
					cancelable: true,
					doingPopState: true,
					dest: newDest,
					viewParams: evt.state.viewParams,
					viewData: evt.state.viewData,
					reverse: backward ? !evt.state.reverse : evt.state.reverse,
					transition: evt.state.transition
				};
				//dcl.mix(opts, {
				//	direction: "end"
				//});
				this.app.emit("dapp-display", opts);

				// Finally: Publish popState topic
				this.app.emit("dapp-popState", opts);
			},

			// when removing the parent and the child view for example +leftParent,left1 when added adds
			// both leftParent and left1, but -leftParent,left1 only hides left1, not leftParent, if you want to
			// hide both you need to do -leftParent,left1-leftParent so we do that on getViewsToRemoveFromDest
			getViewsToRemoveFromDest: function (nextDest, prevDest) {
				var removedDest = "";
				if (nextDest && prevDest) {
					var nextParts = nextDest.split("+");
					var prevParts = prevDest.split("+");
					for (var item in prevParts) {
						if (nextParts.indexOf(prevParts[item]) === -1) {
							var remTemp = prevParts[item]; // remTemp is the item not in the nextParts
							// need to see if another view in nextParts has the same parentView and constraint
							var remViewId = remTemp.replace(/,/g, "_");
							var remView = viewUtils.getViewFromViewId(this.app, remViewId);
							var removeView = true;
							for (var item2 in nextParts) {
								var nextViewId = nextParts[item2].replace(/,/g, "_");
								var nextView = viewUtils.getViewFromViewId(this.app, nextViewId);
								if (remView.parentView.id === nextView.parentView.id &&
									remView.constraint === nextView.constraint) {
									removeView = false;
									break;
								}
							}
							// Need to remove the parent and subparents separately because if there is a nested
							// child in a sidepane for example, and we need to hide the child we also need to close
							// the sidepane.
							if (removeView) {
								var remTemp2 = "";
								var remTempParts = remTemp.split(",");
								if (remTempParts.length > 1) {
									var currRem = "-" + remTempParts.shift();
									remTemp2 = remTemp2 + currRem;
									if (remTempParts.length > 0) {
										while (remTempParts.length > 0) {
											var nxtOne = remTempParts.shift(",");
											currRem = currRem + "," + nxtOne;
											remTemp2 = currRem + remTemp2;
										}
									}
									removedDest = removedDest + remTemp2;
								} else {
									removedDest = removedDest + "-" + prevParts[item];
								}
							}
						}
					}
				}
				return removedDest;
			}
		});
	});
