var nextRound = 1;
var proposedValue = null;
var promisedId = -1;
var numAgents = 0;
var prevAcceptedRound = null;
var prevAcceptedValue = "NULL";
var lastAcceptedId = -1;

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
	} else if (part[0] == 'm_accept') {
		if (part.length > 3) {
			var proposalId = part[1];
			var instanceId = part[2];
			var proposalVal = part[3];
			handleMultiAccept(message.fromAgent, proposalId, instanceId, proposalVal);
			return;
		}
	} else if (part[0] == 'm_accepted') {
		if (part.length > 3) {
			var proposalId = part[1];
			var instanceId = part[2];
			var acceptedVal = part[3];
			handleMultiAccepted(message.fromAgent, proposalId, instanceId, acceptedVal);
		}
	} else if (part[0] == 'm_nack_accept') {
		if (part.length > 2) {
			var proposalId = part[1];
			var instanceId = part[2];
			handleMultiNackAccept(message.fromAgent, proposalId, instanceId);
		}
	}
	else {  //broken message!
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

function requestPaxos(val) {
	console.log('proposing to commit ' + val.length);
	if (transactions.length == 0) {
		proposedValue = val;
		promiseMessages = [];
		numAgents = otherAgents.length + 1;
		var proposalId = makeProposalId(nextRound, agent.id);
		nextRound++;
		sendPrepare(agent.id, proposalId);
	} else {
		sendMultiAccept(lastAcceptedId, transactions.length, val);
	}
}

function sendPrepare(sender, proposalId) {
	message = 'prepare ' + proposalId;
	broadcastMessage(agent.id, message, 'broadcast prepare to');
}

function handlePrepare(sender, proposalId) {
	transactions = [];
	console.log("got prepare request from " + sender);
	var response = '';
	console.log("DEBUG " + proposalId + ' ' + promisedId);
	if (proposalId >= promisedId) {
		promisedId = proposalId;
		response = 'promise ' + proposalId + ' ' + prevAcceptedRound + ' ' + prevAcceptedValue;
	} else {
		response = 'nack_promise ' + proposalId + ' ' + promisedId;
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
		if (multi) {
			sendMultiAccept(proposalId, 0, proposedValue)
		} else {
			sendAccept(proposalId, proposedValue);
		}
	}
}

function sendAccept(proposalId, proposedValue) {
	message = 'accept ' + proposalId + ' ' + proposedValue;
	broadcastMessage(agent.id, message, 'broadcast accept to');
}

function handleAccept(sender, proposalId, acceptVal) {
	console.log('got accept request from ' + sender + ' #=' + proposalId + ' |v|=' + acceptVal.length);
	promisedId = proposalId;
	lastAcceptedId = proposalId;
	acceptedVal = acceptVal;
	sendAccepted(proposalId, acceptedVal);
}

/****************START MULTI PAXOS ADD ON ***************/
var transactions = [];

function sendMultiAccept(proposalId, instanceId, proposedValue) {
	message = 'm_accept ' + proposalId + ' ' + instanceId + ' ' + proposedValue;
	broadcastMessage(agent.id, message, 'broadcast accept to');
}

function handleMultiAccept(sender, proposalId, instanceId, acceptVal) {
	console.log('got multiAccept request from ' + sender + ' p#=' + proposalId + ' i#=' + instanceId + ' |v|=' + acceptVal.length);
	if (instanceId == transactions.length) {
		promisedId = proposalId;
		lastAcceptedId = proposalId;
		acceptedVal = acceptVal;
		sendMultiAccepted(proposalId, instanceId, acceptedVal);
	} else {
		sendMultiNackAccept(proposalId, instanceId);
	}
}

function sendMultiAccepted(proposalId, instanceId, acceptedVal) {
	message = 'm_accepted ' + proposalId + ' ' + instanceId + ' ' + acceptedVal;
	broadcastMessage(agent.id, message, 'broadcast multi-accept message to ');
}

function sendMultiNackAccept(proposalId, instanceId) {
	message = 'm_nack_accept ' + proposalId + ' ' + instanceId;
	broadcastMessage(agent.id, message, 'broadcast nack-multi-accept to ');
}

function handleMultiAccepted (sender, proposalId, instanceId, acceptVal) {
	console.log("got accepted message from " + sender + " with length " + acceptVal.length)
	transactions.push(acceptVal);
	commitPlan(acceptVal);
}

function handleMultiNackAccept (sender, propsalId, instanceId) {
	transactions.splice(instanceId);
	if (transactions.length > 0) {
		commitPlan(transactions.length - 1);
	} else {
		commitPlan("");
	}
	transactions = [];
}




/************************** END MULTI PAXOS ADD ON ********/

function sendAccepted(proposalId, acceptedVal) {
	message = 'accepted ' + proposalId + ' ' + acceptedVal;
	broadcastMessage(agent.id, message, 'broadcast accepted message to');
}

function handleAccepted(sender, roundNumber, roundValue) {
	console.log('!!! got accepted value from ' + sender + ' #=' + roundNumber + ' v=' + roundValue);
	commitPlan(roundValue);
}

function broadcastMessage(fromAgent, message, responsePreamble) {
	var postData = {fromAgent: fromAgent, message: message};
	httpPostJSONAsync('/agents/broadcast', postData, function(res) {
	console.log(responsePreamble + ' ' + res);
	});
}