define(["dojo/dom", "dojo/dom-style", "dojo/_base/connect", "dojo/_base/lang","dijit/registry", "dojox/mvc/at", "dojox/mobile/TransitionEvent",
		"dojox/mvc/Repeat", "dojox/mvc/getStateful", "dojox/mvc/Output", "dojo/sniff"],
function(dom, domStyle, connect, lang, registry, at, TransitionEvent, Repeat, getStateful, Output, has){
	var _connectResults = []; // events connect result

	var repeatmodel = null;	//repeat view data model
	
	// these ids are updated here and in the html file to avoid duplicate ids
	var backId = 'sc1back1';
	var insert1Id = 'sc1insert1x';
	var insert10Id = 'sc1insert10x';
	var remove10Id = 'sc1remove10x';
	var wrapperIdA = 'sc1WrapperA';
	var wrapperIdB = 'sc1WrapperB';
	var wrapperIdC = 'sc1WrapperC';
	var wrapperIdD = 'sc1WrapperD';

	var app = null;
	
	// delete an item
	deleteResult = function(index){
		var nextIndex = repeatmodel.get("cursorIndex");
		if(nextIndex >= index){
			nextIndex = nextIndex-1;
		}
		repeatmodel.model.splice(index, 1);
		repeatmodel.set("cursorIndex", nextIndex);		
	};
	// show an item detail
	setDetailsContext = function(index){
		repeatmodel.set("cursorIndex", index);		
	};
	
	removeScrollableItem = function(index){
				var repeatmodel = app.loadedModels.repeatmodels;
				repeatmodel.model.splice(index, 1);
				return false; 	 		
	};

	// insert an item
	var insertResult = function(index, e){
		if(index<0 || index>repeatmodel.model.length){
			throw Error("index out of data model.");
		}
		if((repeatmodel.model[index].First=="") ||
			(repeatmodel.model[index+1] && (repeatmodel.model[index+1].First == ""))){
			return;
		}
		var data = {id:Math.random(), "First": "", "Last": "", "Location": "CA", "Office": "", "Email": "", "Tel": "", "Fax": ""};
		repeatmodel.model.splice(index+1, 0, new getStateful(data));
		setDetailsContext(index+1);
		var transOpts = {
			title : "repeatDetails",
			target : "repeatDetails",
			url : "#repeatDetails", // this is optional if not set it will be created from target   
			params : {"cursor":index+1}
		};
		new TransitionEvent(e.target, transOpts, e).dispatch(); 
		
	};

	// get index from dom node id
	var getIndexFromId = function(nodeId, perfix){
		var len = perfix.length;
		if(nodeId.length <= len){
			throw Error("repeate node id error.");
		}
		var index = nodeId.substring(len, nodeId.length);
		return parseInt(index);
	};

	return {
		// repeate view init
		init: function(){
			app = this.app;

			repeatmodel = this.loadedModels.repeatmodels;
			var connectResult;

			connectResult = connect.connect(dom.byId(insert1Id), "click", function(e){
				insertResult(repeatmodel.model.length-1,e);
			});
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId(insert10Id), "click", function(){
				//Add 10 items to the end of the model
				app.showProgressIndicator(true);
				setTimeout(lang.hitch(this,function(){
					maxentries = repeatmodel.model.length+10;
					for(var i = repeatmodel.model.length; i < maxentries; i++){
						var data = {id:Math.random(), "First": "First"+repeatmodel.model.length, "Last": "Last"+repeatmodel.model.length, "Location": "CA", "Office": "", "Email": "", "Tel": "", "Fax": ""};
						repeatmodel.model.splice(repeatmodel.model.length, 0, new getStateful(data));					
					}
					app.showProgressIndicator(false);
				}), 100);				
				
			});
			_connectResults.push(connectResult);

			connectResult = connect.connect(dom.byId(remove10Id), "click", function(){
				//remove 10 items to the end of the model
				app.showProgressIndicator(true);
				setTimeout(lang.hitch(this,function(){				
					maxentries = repeatmodel.model.length-10;
					for(var i = repeatmodel.model.length; i > maxentries; i--){
						repeatmodel.model.splice(i, 1);
					}
					repeatmodel.set("cursorIndex", 0);		
					app.showProgressIndicator(false);
				}), 100);				
			});
			_connectResults.push(connectResult);
		},


		beforeActivate: function(){
			// summary:
			//		view life cycle beforeActivate()
			if(dom.byId(backId) && !has("phone")){ 
				domStyle.set(dom.byId(backId), "visibility", "hidden"); // hide the back button in tablet mode
			}
			if(dom.byId("tab1WrapperA")){ 
				domStyle.set(dom.byId("tab1WrapperA"), "visibility", "visible");  // show the nav view if it being used
				domStyle.set(dom.byId("tab1WrapperB"), "visibility", "visible");  // show the nav view if it being used
			}
			//domStyle.set(dom.byId(wrapperIdA), "visibility", "visible");  // show the view when it is ready
			//domStyle.set(dom.byId(wrapperIdB), "visibility", "visible");  // show the view when it is ready
			//domStyle.set(dom.byId(wrapperIdC), "visibility", "visible");  // show the view when it is ready
			//domStyle.set(dom.byId(wrapperIdD), "visibility", "visible");  // show the view when it is ready
		},

		afterActivate: function(){
			// summary:
			//		view life cycle afterActivate()
		},
		
		
		destroy: function(){
			var connectResult = _connectResults.pop();
			while(connectResult){
				connect.disconnect(connectResult);
				connectResult = _connectResults.pop();
			}
		}
	};
});