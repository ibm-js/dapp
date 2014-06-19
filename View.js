define(["require", "dojo/when", "dojo/on", "dcl/dcl", "dojo/Deferred", "delite/Widget", "delite/register",
		"delite/handlebars", "./ViewBase", "./utils/nls"
	],
	function (require, when, on, dcl, Deferred, Widget, register, handlebars, ViewBase, nls) {
		return dcl([ViewBase, Widget], {
			// summary:
			//		View class inheriting from ViewBase adding templating & globalization capabilities.
			constructor: function (params) { // jshint unused:false
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
				// params:
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

			// _TemplatedMixin requires a connect method if data-dojo-attach-* are used
			connect: function (obj, event, method) {
				return this.own(on(obj, event, method.bind(this)))[0]; // handle
			},

			_loadTemplate: function () {
				// summary:
				//		load view HTML template and dependencies.
				// tags:
				//		private
				//
				if (this.templateString) {
					return true;
				} else {
					var tpl = this.template;
					var deps = this.dependencies ? this.dependencies : [];
					if (tpl) {
						deps = deps.concat(["requirejs-text/text!" + tpl]);
					}
					var loadViewDeferred = new Deferred();
					require(deps, function () {
						this.templateString = this.template ? arguments[arguments.length - 1] : "<div></div>";
						loadViewDeferred.resolve(this);
					}.bind(this));
					return loadViewDeferred;
				}
			},

			// start view
			load: dcl.superCall(function (sup) {
				return function () {
					var tplDef = new Deferred();
					var defDef = sup.call(this);
					var nlsDef = nls(this);
					// when parentView loading is done (controller), proceed with template
					defDef.then(function () {
						when(nlsDef, function (nls) {
							// we inherit from the parentView NLS
							this.nls = {};
							if (this.parentView) {
								dcl.mix(this.nls, this.parentView.nls);
							}
							if (nls) {
								// make sure template can access nls doing {{nls.myprop}}
								dcl.mix(this.nls, nls);
							}
							when(this._loadTemplate(), function (value) {
								tplDef.resolve(value);
							});
						}.bind(this));
					}.bind(this));
					return tplDef.promise;
				};
			}),

			// in another place it was mentioned that may want to change from startup --> enteredViewCallback.
			_startup: dcl.superCall(function (sup) {
				return function () {
					// summary:
					//		startup widgets in view template.
					// tags:
					//		private
					var params = {
						baseClass: "d-" + this.id,
						buildRendering: handlebars.compile(this.templateString)
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
					for (var i = 0; i < this._viewAttributeNames.length; i++) {
						viewAttributes[this._viewAttributeNames[i]] = this[this._viewAttributeNames[i]];
					}
					viewAttributes.nls = this.nls; // add nls strings to viewAttributes
					dcl.mix(params, viewAttributes);

					var tag = "dapp-view-" + this.id.toLowerCase();
					register(tag, [HTMLElement, Widget], params);

					this.domNode = register.createElement(tag);
					this.own(this.domNode);
					this.domNode.id = this.id;

					//had to do this for widgets in templates to work
					this.domNode.containerNode = this.domNode;
					this.domNode.startup();
					this.domNode.viewId = this.id;

					if (!this.containerNode) {
						if (this.containerSelector) {
							this.containerNode = this.domNode.querySelector(this.containerSelector);
						} else if (this.domNode.children[0]) {
							this.containerNode = this.domNode.children[0];
						}
					}

					sup.call(this);
				};
			})
		});
	});
