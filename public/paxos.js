var maxRound = 0;
var proposedValue = "";
var numAgents = -1;
var prevAcceptedRound = -1;
var prevAcceptedValue = "null";

function handleMessage(message) {
	messageBody = message.message;
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
		handleNackPromise();
	} else {  //broken message!
		console.log('incorrect message format! ' + messageBody);
	}
}

var haveConsensus = false;
var promiseMessages = [];
var numParticipating = -1;

//Local agent uses this to initiate a paxos round
function requestPaxos(proposedValue) {
	promiseMessages = [];
	haveConsensus = false;
	numAgents = otherAgents.length + 1;
	var roundNumber = maxRound * 100 + agent.id;  //Incorporating agent id as lower order digits 
	prevAcceptedRound = maxRound;
	prevAcceptedValue = proposedValue;
	httpGetAsync('/agents/broadcast/' + agent.id + '/prepare ' + roundNumber, function(res) {
		console.log('broadcast prepare to ' + res);
		numParticipating = JSON.parse(res).length;
	});
	maxRound++;
}

function handlePrepare(sender, roundNumber) {
	console.log("got prepare request from " + sender);
	var response = '';
	if (roundNumber > maxRound) {
		prevAcceptedRound = Math.floor(roundNumber / 100);
		response = 'promise ' + prevAcceptedRound + ' ' + prevAcceptedValue;
	} else {
		response = 'nack_promise';  //SHOULD WE NACK??? //TODO
	}
	httpGetAsync('/agents/communicate/' + agent.id + '/' + sender + '/' + response, function(res) {
		console.log('sent promise to ' + sender + ' ' + res);
	});
}

function handleNackPromise(sender) {
	numParticipating--;
	console.log('NACK!!! failed to promise!');
	if (haveConsensus && numParticipating == 0) {
		requestAccept();
	}
}

function handlePromise(sender, roundNumber, roundValue) { 
	console.log("got promise result from " + sender);
	numParticipating--;
	promiseMessages.push({sender: sender, n: roundNumber, v: roundValue});
	console.log('commited is ' + promiseMessages.length);
	if (promiseMessages.length >= Math.floor(numAgents / 2) + 1) {
		console.log('have consensus');
		haveConsensus = true;
	}
	if (haveConsensus && numParticipating == 0) {
			requestAccept();
	}
}

//run once we have all responses.
function requestAccept() {
	var roundNumber = maxRound * 100 + agent.id;
	var vMax = -1;
	for (var i = 0; i < promiseMessages.length; i++) {
		if (promiseMessages.v > vMax) vMax = promiseMessages.v;
	}
	httpGetAsync('/agents/broadcast/' + agent.id + '/accept ' + roundNumber + ' ' + vMax, function (res) {
		console.log('broadcast accept message to ' + res);
	});
}

function handleAccept(sender, roundNumber, roundValue) {
	console.log('got accept request from ' + sender + ' #=' + roundNumber + ' v=' + roundValue);
}

function handleAccepted() {;}