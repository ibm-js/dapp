define(["require", "dcl/dcl", "lie/dist/lie", "delite/Widget", "delite/register",
		"delite/handlebars", "./ViewBase", "./utils/nls"
	],
	function (require, dcl, Promise, Widget, register, handlebars, ViewBase, nls) {
		return dcl([ViewBase], {
			// summary:
			//		View class inheriting from ViewBase adding templating & globalization capabilities.
			constructor: function (viewParams) { // jshint unused:false
				// summary:
				//		Constructs a View instance either from a configuration or programmatically.
				//
				// example:
				//		|	use configuration file
				//		|
				//		|	// load view controller from views/simple.js by default
				//		|	"simple":{
				//		|		"template": "myapp/views/simple.html",
				//		|		"nls": "myapp/nls/simple"
				//		|		"dependencies":["dojox/mobile/TextBox"]
				//		|	}
				//		|
				//		|	"home":{
				//		|		"template": "myapp/views/home.html", // no controller set so no view controller
				//		|		"dependencies":["dojox/mobile/TextBox"]
				//		|	}
				//		|	"main":{
				//		|		"template": "myapp/views/main.html",
				//		|		"controller": "myapp/views/main.js", // identify view controller from views/main.js
				//		|		"dependencies":["dojox/mobile/TextBox"]
				//		|	}
				//
				// example:
				//		|	var viewObj = new View({
				//		|		app: this.app,
				//		|		id: this.id,
				//		|		name: this.name,
				//		|		parentView: this,
				//		|		templateString: this.templateString,
				//		|		template: this.template,
				//		|		controller: this.controller
				//		|	});
				//		|	viewObj.start(); // start view
				//
				// viewParams:
				//		view parameters, include:
				//
				//		- app: the app
				//		- id: view id
				//		- name: view name
				//		- template: view template identifier. If templateString is not empty, this parameter ignored
				//		- templateString: view template string
				//		- controller: view controller module identifier
				//		- parentView: parent view
				//		- children: children views
				//		- nls: nls definition module identifier
			},

			_loadTemplate: function () {
				// summary:
				//		load view HTML template and dependencies.
				// tags:
				//		private
				//
				return new Promise(function (resolve) {
					if (this.templateString) {
						resolve();
					} else {
						var tpl = this.template;
						var deps = this.dependencies ? this.dependencies : [];
						if (tpl) {
							deps = deps.concat(["requirejs-text/text!" + tpl]);
						}
						require(deps, function () {
							this.templateString = this.template ?
								arguments[arguments.length - 1] : "<div></div>";
							resolve();
						}.bind(this));
					}
				}.bind(this));
			},
			// start view
			load: dcl.superCall(function (sup) {
				return function () {
					// when parentView loading is done (controller), proceed with template
					var controller = sup.call(this);
					return nls(this).then(function (nls) {
						// we inherit from the parentView NLS
						this.nls = {};
						if (this.parentView) {
							dcl.mix(this.nls, this.parentView.nls);
						}
						// make sure template can access nls doing {{nls.myprop}}
						dcl.mix(this.nls, nls);
					}.bind(this)).then(this._loadTemplate.bind(this)).then(function () {
						return controller;
					});
				};
			}),

			setupViewParams: function (controller) {
				// summary:
				//		setup the viewParams before creating the node
				var viewParams = {
					baseClass: "d-" + this.id,
					template: handlebars.compile(this.templateString)
						/* leaving this in case it is helpful to debug things later
						preCreate: function () {
							console.log("View._startup in view preCreate for [" + self.id + "]");
						},
						postCreate: function () {
							console.log("View._startup in view postCreate for [" + self.id + "]");
						},
						refreshRendering: dcl.after(function () {
							console.log("View._startup in view refreshRendering for [" + self.id + "]");
						})
						*/
				};
				var viewAttributes = {};
				if (controller) {
					// Here we need to setup the attributes for the view from the properties on the controller.
					// loop thru controller properties and add to viewAttributes if not private or a function
					Object.keys(controller).forEach(function (prop) {
						if (!/^_/.test(prop)) { // TODO: should we skip private properties for viewParams?
							if (typeof controller[prop] !== "function") {
								var copyVal = controller[prop]; // needed for setting values of 0
								viewAttributes[prop] = copyVal;
							}
						}
					});
				}
				viewAttributes.nls = this.nls; // add nls strings to viewAttributes
				dcl.mix(viewParams, viewAttributes);

				return viewParams;
			},

			_safeMixIntoNode: function (copyTo, copyFrom) {
				// mix things from copyFrom into the domNode if they are not already in copyTo
				for (var n in copyFrom) {
					// do not mixin if already set copyTo
					if (!copyTo[n] && n !== "parentNode") {
						var copyVal = copyFrom[n]; // needed for setting values of 0
						copyTo[n] = copyVal;
					}
				}

			},

			// in another place it was mentioned that may want to change from startup --> enteredViewCallback.
			_startup: dcl.superCall(function (sup) {
				return function (controller) {
					// summary:
					//		startup widgets in view template.
					// tags:
					//		private
					var viewParams = this.setupViewParams(controller);
					var tag = "dapp-view-" + this.id.toLowerCase();
					var TagWidget = register(tag, [HTMLElement, Widget], viewParams);

					var newDomNode = new TagWidget();

					//had to do this for widgets in templates to work
					newDomNode.startup();

					newDomNode.viewId = this.id;
					//newDomNode.id = this.id;
					this._safeMixIntoNode(newDomNode, this); // do not mixin "template"
					if (!newDomNode.containerNode) { //TODO: never seem to have a containerNode already set, remove?
						if (newDomNode.containerSelector) { //TODO: need test with containerSelector
							newDomNode.containerNode = newDomNode.querySelector(newDomNode.containerSelector);
						} else if (newDomNode.children[0]) {
							newDomNode.containerNode = newDomNode.children[0];
						}
					}
					this.domNode = newDomNode;

					sup.call(this);
				};
			})
		});
	});
