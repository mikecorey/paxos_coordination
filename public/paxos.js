var maxRound = -1;
var proposedValue = "";
var numAgents = -1;
var prevAcceptedRound = -1;
var prevAcceptedValue = "null";

function handleMessage(message) {
	messageBody = message.message;
	console.log(messageBody);
	var part = messageBody.split(' ');
	if (part[0] == 'prepare') {
		if (part.length > 1) {
			var roundNumber = part[1];
			handlePrepare(message.fromAgent, roundNumber);
		}
	} else if (part[0] == 'promise') {
		if (part.length > 2) {
			var roundNumber = part[1];
			var roundValue = part[2];
			handlePromise(message.fromAgent, roundNumber, roundValue);
		}
	} else if (part[0] == 'accept') {
		if (part.length > 2) {
			var roundNumber = part[1];
			var newValue = part[2];
			handleAccept(message.fromAgent, roundNumber, newValue);
		}
	} else if (part[0] == 'accepted') {
		console.log('got accepted result!');
	} else if (part[0] == 'nack_promise') {
		console.log('NACK!!! failed to promise!');
	} else {  //broken message!
		console.log('incorrect message format! ' + messageBody);
	}
}

var promiseMessages = [];

//Local agent uses this to initiate a paxos round
function requestPaxos(proposedValue) {
	promiseMessages = [];
	numAgents = otherAgents.length + 1;
	var roundNo = maxRound * 100 + agent.id;  //Incorporating agent id as lower order digits 
	httpGetAsync('/agents/broadcast/' + agent.id + '/prepare ' + roundNo, function(res) {
		console.log('broadcast prepare to ' + res);
	});
	maxRound++;
}

function handlePrepare(sender, roundNumber) {
	console.log("got prepare request from " + sender);
	var response = '';
	if (roundNumber > maxRound) {
		maxRound = roundNumber / 100;
		response = 'promise ' + prevAcceptedRound + ' ' + prevAcceptedValue;
	} else {
		response = 'nack_promise';  //SHOULD WE NACK??? //TODO
	}
	httpGetAsync('/agents/communicate/' + agent.id + '/' + sender + '/' + response, function(res) {
		console.log('sent promise to ' + sender + ' ' + res);
	});
}

function handlePromise(sender, lastRoundNumber, lastRoundValue) { 
	console.log("got promise result from " + sender);
	if (lastRoundNumber / 100 < maxRound) {
		promiseMessages.push({sender: sender, n: lastRoundNumber, v:lastRoundValue});
		if (promiseMessages.length >= Math.floor(numAgents / 2) + 1) {
			console.log('have consensus');
			var vMax = -1;
			var roundNumber = -1;
			//httpGetAsync('/agents/broadcast/' + agent.id + '/accept ' + )
		}
		console.log('commited is ' + promiseMessages.length);
	} else {
		console.log('paxos failed.  newer round exists');
	}
}

function handleAccept() {
	console.log('got accept request!')
}

function handleAccepted() {;}