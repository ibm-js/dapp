define(["require", "dojo/when", "dojo/on", "dojo/dom-attr", "dojo/dom-style", "dojo/_base/declare", "dojo/_base/lang",
	"dojo/Deferred", "./utils/constraints"],
	function(require, when, on, domAttr, domStyle, declare, lang, Deferred, constraints){
	return declare(null, {
		// summary:
		//		View base class with controller capabilities. Subclass must implement rendering capabilities.
		constructor: function(params){
			// summary:
			//		Constructs a ViewBase instance.
			// params:
			//		view parameters, include:
			//
			//		- app: the app
			//		- id: view id
			//		- name: view name
			//		- parent: parent view
			//		- controller: view controller module identifier
			//		- children: children views
			this.id = "";
			this.name = "";
			this.children = {};
			this.selectedChildren = {};
			this.loadedStores = {};
			this.transitionCount = 0;

			// skipNodeCache: [protected] Boolean (from dijit._TemplatedMixin)
			//		If using a cached widget template nodes poses issues for a
			//		particular widget class, it can set this property to ensure
			//		that its template is always re-built from a string
			this._skipNodeCache = true; // use true to avoid Detached domNodes for each view created.

			// private
			this._started = false;
			lang.mixin(this, params);
			// mixin views configuration to current view instance.
			if(this.parent.views){
				lang.mixin(this, this.parent.views[this.name]);
			}
		},

		// start view
		start: function(){
			// summary:
			//		start view object.
			//		load view template, view controller implement and startup all widgets in view template.
			if(this._started){
				return this;
			}
			this._startDef = new Deferred();
			when(this.load(), lang.hitch(this, function(){
				this._createDataStore();
				this._startup();
			}));
			return this._startDef;
		},

		load: function(){
			var vcDef = this._loadViewController();
			when(vcDef, lang.hitch(this, function(controller){
				if(controller){
					lang.mixin(this, controller);
				}
			}));
			return vcDef;
		},

		_createDataStore: function(){
			// summary:
			//		Create data store instance for View specific stores
			//
			// TODO: move this into a common place for use by main and ViewBase
			//
			if(this.parent.loadedStores){
				lang.mixin(this.loadedStores, this.parent.loadedStores);
			}

			if(this.stores){
				//create stores in the configuration.
				for(var item in this.stores){
					if(item.charAt(0) !== "_"){//skip the private properties
						var type = this.stores[item].type ? this.stores[item].type : "dojo/store/Memory";
						var config = {};
						if(this.stores[item].params){
							lang.mixin(config, this.stores[item].params);
						}
						// we assume the store is here through dependencies
						try{
							var storeCtor = require(type);
						}catch(e){
							throw new Error(type+" must be listed in the dependencies");
						}
						if(config.data && lang.isString(config.data)){
							//get the object specified by string value of data property
							//cannot assign object literal or reference to data property
							//because json.ref will generate __parent to point to its parent
							//and will cause infinitive loop when creating StatefulModel.
							config.data = lang.getObject(config.data);
						}
						if(this.stores[item].observable){
							try{
								var observableCtor = require("dojo/store/Observable");
							}catch(e){
								throw new Error("dojo/store/Observable must be listed in the dependencies");
							}
							this.stores[item].store = observableCtor(new storeCtor(config));
						}else{
							this.stores[item].store = new storeCtor(config);
						}
						this.loadedStores[item] = this.stores[item].store; // add this store to loadedStores for the view							
					}
				}
			}
		},

		_startup: function(){
			// summary:
			//		startup widgets in view template.
			// tags:
			//		private

			this._initViewHidden();
			this._needsResize = true; // flag used to be sure resize has been called before transition

			this._startLayout();
		},

		_initViewHidden: function(){
			domStyle.set(this.domNode, "visibility", "hidden");
		},

		_startLayout: function(){
			// summary:
			//		startup widgets in view template.
			// tags:
			//		private
			this.app.log("  > in app/ViewBase _startLayout firing layout for name=[",this.name,"], parent.name=[",this.parent.name,"]");

			if(!this.hasOwnProperty("constraint")){
				this.constraint = domAttr.get(this.domNode, "data-app-constraint") || "center";
			}
			constraints.register(this.constraint);


			this.app.emit("app-initLayout", {
				"view": this, 
				"callback": lang.hitch(this, function(){
						//start widget
						this.startup();

						// call view assistant's init() method to initialize view
						this.app.log("  > in app/ViewBase calling init() name=[",this.name,"], parent.name=[",this.parent.name,"]");
						this.init();
						this._started = true;
						if(this._startDef){
							this._startDef.resolve(this);
						}
				})
			});
		},


		_loadViewController: function(){
			// summary:
			//		Load view controller by configuration or by default.
			// tags:
			//		private
			//
			var viewControllerDef = new Deferred();
			var path;

			if(!this.controller){ // no longer using this.controller === "none", if we dont have one it means none.
				this.app.log("  > in app/ViewBase _loadViewController no controller set for view name=[",this.name,"], parent.name=[",this.parent.name,"]");
				viewControllerDef.resolve(true);
				return viewControllerDef;
			}else{
				path = this.controller.replace(/(\.js)$/, "");
			}

			var requireSignal;
			try{
				requireSignal = require.on("error", function(error){
					if(viewControllerDef.isResolved() || viewControllerDef.isRejected()){
						return;
					}
					if(error.info[0] && (error.info[0].indexOf(path) >= 0)){
						viewControllerDef.resolve(false);
						requireSignal.remove();
					}
				});
				require([path], function(controller){
					viewControllerDef.resolve(controller);
					requireSignal.remove();
				});
			}catch(e){
				viewControllerDef.reject(e);
				if(requireSignal){
					requireSignal.remove();
				}
			}
			return viewControllerDef;
		},

		init: function(){
			// summary:
			//		view life cycle init()
		},

		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
		},

		afterActivate: function(){
			// summary:
			//		view life cycle afterActivate()
		},

		beforeDeactivate: function(){
			// summary:
			//		view life cycle beforeDeactivate()
		},

		afterDeactivate: function(){
			// summary:
			//		view life cycle afterDeactivate()
		},

		destroy: function(){
			// summary:
			//		view life cycle destroy()
		}
	});
});
