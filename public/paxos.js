var nextRound = 1;
var proposedValue = null;
var promisedId = -1;
var numAgents = 0;
var prevAcceptedRound = null;
var prevAcceptedValue = "NULL";
var lastAcceptedId = -1;

var numParticipating = -1; 		//This is set by prepare based on the number of broadcast responses. Used to see how many responses we need.
var promiseMessages = [];

function handleMessage(message) {
	messageBody = message.message;
	console.log('message: ' + messageBody);
	var part = messageBody.split(' ');
	if (part[0] == 'prepare') {
		if (part.length > 1) {
			var proposalId = part[1];
			handlePrepare(message.fromAgent, proposalId);
			return;
		}
	} else if (part[0] == 'promise') {
		if (part.length > 3) {
			var proposalId = part[1];
			var previoudId = part[2]
			var acceptedVal = part[3];
			handlePromise(message.fromAgent, proposalId, previoudId, acceptedVal);
			return;
		}
	} else if (part[0] == 'accept') {
		if (part.length > 2) {
			var proposalId = part[1];
			var proposalVal = part[2];
			handleAccept(message.fromAgent, proposalId, proposalVal);
			return;
		}
	} else if (part[0] == 'accepted') {
		if (part.length > 2) {
			var proposalId = part[1];
			var acceptedVal = part[2];
			handleAccepted(message.fromAgent, proposalId, acceptedVal);
			return;
		}
	} else if (part[0] == 'nack_promise') {
		handleNackPromise(message.fromAgent, part[1], part[2]);
	} else {  //broken message!
		console.log('incorrect message format! ' + messageBody);
	}
}

function makeProposalId(roundNumber, agentId) {
	return roundNumber * 1000 + agentId;	//breaks on > 999 agents
}

function resolveRoundNumberOfProposalId(proposalId) {
	return Math.floor(proposalId / 1000); //Tosses out agentId
}

function resolveAgentOfProposalId(proposalId) {
	return proposalId % 1000;
}


//Local agent uses this to initiate a paxos round
function requestPaxos(val) {
	console.log('proposing to commit ' + val);
	proposedValue = val;
	promiseMessages = [];
	numAgents = otherAgents.length + 1;
	var proposalId = makeProposalId(nextRound, agent.id);
	nextRound++;
	sendPrepare(agent.id, proposalId);
}

function sendPrepare(sender, proposalId) {
	httpGetAsync('/agents/broadcast/' + agent.id + '/prepare ' + proposalId, function(res) {
		console.log('broadcast prepare to ' + res);
		numParticipating = JSON.parse(res).length;
	});
}

function handlePrepare(sender, proposalId) {
	console.log("got prepare request from " + sender);
	var response = '';
	//proposalId = resolveRoundNumberOfProposalId(proposalId);
	console.log("DEBUG " + proposalId + ' ' + promisedId);
	if (proposalId >= promisedId) {
		promisedId = proposalId;
		response = 'promise ' + proposalId + ' ' + prevAcceptedRound + ' ' + prevAcceptedValue;
	} else {
		response = 'nack_promise ' + proposalId + ' ' + promisedId;  //SHOULD WE NACK??? //TODO IF NACK > PROMISE && AWAITING 0
	}
	sendPromise(agent.id, sender, response);	//TODO Not good form
}

function sendPromise(fromAgent, toAgent, response) {
	httpGetAsync('/agents/communicate/' + fromAgent + '/' + toAgent + '/' + response, function(res) {
		console.log('sending ' + response.split(' ')[0] + ' response to ' + toAgent + ': ' + res);
	});
}

function handleNackPromise(sender, proposalId, promisedId) {
	console.log('got nack_promise from ' + sender + ' proposalId=' + proposalId + ' promisedId=' + promisedId);
}

function handlePromise(sender, proposalId, previoudId, acceptedVal) { 
	console.log("got promise result from " + sender);
	promiseMessages.push({sender: sender, n: previoudId, v: acceptedVal});
	if (previoudId > lastAcceptedId) {
		console.log('have newer value.  discarding proposed.');
		lastAcceptedId = previoudId;
		if (acceptedVal != "NULL") {
			proposedValue = acceptedVal;
		}
	}
	console.log('commited is ' + promiseMessages.length);
	if (promiseMessages.length == Math.floor(numAgents / 2) + 1) {
		console.log('reached consensus');
		sendAccept(proposalId, proposedValue);
	}
}

function sendAccept(proposalId, proposedValue) {
	httpGetAsync('/agents/broadcast/' + agent.id + '/accept ' + proposalId + ' ' + proposedValue, function (res) {
		console.log('broadcast accept message to ' + res);
	});
}

function handleAccept(sender, proposalId, acceptVal) {
	console.log('got accept request from ' + sender + ' #=' + proposalId + ' v=' + acceptVal);
	promisedId = proposalId;
	acceptedId = proposalId;
	acceptedVal = acceptVal;
	sendAccepted(proposalId, acceptedVal);
}

function sendAccepted(proposalId, acceptedVal) {
	httpGetAsync('/agents/broadcast/' + agent.id + '/accepted ' + proposalId + ' ' + acceptedVal, function (res) {
		console.log('broadcast accepted message to ' + res);
	});
}


function handleAccepted(sender, roundNumber, roundValue) {
	console.log('!!! got accepted value from ' + sender + ' #=' + roundNumber + ' v=' + roundValue);
}