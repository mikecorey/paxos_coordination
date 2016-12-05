var maxRound = 0;
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
			handlePrepare(message.fromAgent, part[1]);
		}
	} else if (part[0] == 'promise') {
		if (part.length > 2) {
			handlePromise(message.fromAgent, part[1], part[2]);
		}
	} else if (part[0] == 'accept') {
		console.log('got accept request!')
	} else if (part[0] == 'accepted') {
		console.log('got accepted result!');
	} else if (part[0] == 'nack_promise') {
		console.log('NACK!!! failed to promise!');
	} else {  //broken message!
		console.log('incorrect message format! ' + messageBody);
	}
}

var commitedAgents = [];

//Local agent uses this to initiate a paxos round
function requestPaxos(proposedValue) {
	commitedAgents = [];
	numAgents = otherAgents.length + 1;
	var roundNo = maxRound * 100 + agent.id;  //Incorporating agent id as lower order digits 
	httpGetAsync('/agents/broadcast/' + agent.id + '/prepare ' + roundNo, function(res) {
		console.log('sent prepare to ' + res);
	});
	maxRound++;
}

function handlePrepare(sender, roundNumber) {
	console.log("got prepare request!");
	var response = '';
	if (roundNumber > maxRound) {
		maxRound == roundNumber / 100;
		response = 'promise ' + prevAcceptedRound + ' ' + prevAcceptedValue;
	} else {
		response = 'nack_promise';  //SHOULD WE NACK??? //TODO
	}
	httpGetAsync('/agents/communicate/' + agent.id + '/' + sender + '/' + response, function(res) {
		console.log('sent promise to ' + res);
	});
}

function handlePromise(sender, lastRoundNumber, lastRoundValue) { 
	console.log("got promise result!");
	if (lastRoundNumber / 100 < maxRound) {
		commitedAgents.push(sender);
		if (commitedAgents.length >= (numAgents / 2) + 1) {
			console.log('have consensus');
		}
		console.log('commited is ' + commitedAgents.length);
	} else {
		console.log('paxos failed.  newer round exists');
	}
}

function handleAccept() {;}

function handleAccepted() {;}