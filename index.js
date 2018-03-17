const pid = process.pid;
let isChild = false;

function log(message) {
	console.log(`[${isChild ? 'Child' : 'Self'} - ${pid}] ${message}`);
}

if (process.connected) {
	isChild = true;

	process.on('disconnect', ()=> {
		log(`Disconnected from Parent`);
	});

	process.on('message', (message, sendHandle)=> {
		log(`Received from Parent: ${message}`);
		log('Echoing to Parent');
		sendHandle.send(message);
	});
}

log(`Arguments: ${process.execArgv.length === 0 ? 'None' : process.execArgv}`);
log(`OS: ${process.platform}`);
log(`Parent: ${process.ppid}`);


process.stdin.resume();
let isClosing = false;

function exitHandler(options) {
	if (!isClosing) {
		isClosing = true;
		console.log("Shutting down...");

		if (options.exit)
			process.exit();
	}
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid"
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
process.on('SIGTERM', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: false }));