const pid = process.pid;
let isChild = false;

function log(message) {
	if (isChild) {
		process.send(`[Child - ${pid}] ${message}`);
	} else {
		console.log(`[Self - ${pid}] ${message}`);
	}
}

if (process.connected) {
	isChild = true;

	process.on('disconnect', ()=> {
		log(`Disconnected from Parent`);
		process.exit();
	});

	process.on('message', (message)=> {
		log(`Received from Parent: ${message}`);
		log('Echoing to Parent');
		process.send(message);
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
		log("Shutting down...");

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