require(["dapp/main", "dojo/json", "dojo/text!./config.json", "dojo/sniff"],
function(Application, json, config, has){
	has.add("ie9orLess", has("ie") && (has("ie") <= 9));
	Application(json.parse(config));
});
