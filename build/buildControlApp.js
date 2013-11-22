define(["build/buildControlDefault"], function (bc) {
	// module:
	//		dapp/build/buildControlApp
	// summary:
	//		This module extend default build control module to add dapp build support
	// enhance buildControl
	bc.discoveryProcs.splice(0, 0, "dapp/build/discoverAppConfig");
	return bc;
});
