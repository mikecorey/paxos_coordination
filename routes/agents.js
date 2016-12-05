var express = require('express');
var winston = require('winston');

var router = express.Router();

var model = require('../model/model'); 

var maxComDistance = .088;

var agents = [];

//mapping from agent id to agents[idx]
function getAgentIdx(id) {
	for (var i = 0; i < agents.length; i++) {
		if (agents[i].id == id) {
			return i;
		} 
	}
	var e = new Error('bad idx');
	console.log('bad idx' + id);
	return -1;
}

router.get('/status/:agentId?', function(req, res) {
	if (req.params.agentId) {
		var agentId = parseInt(req.params.agentId, 10);
		winston.log('info', 'requesting agent ' + agentId);
		var returningAgent = agents[getAgentIdx(agentId)];
		if (typeof returningAgent === 'undefined') {
			res.status(404).send("not found");
		} else {
			res.status(200).send(JSON.stringify(agents[getAgentIdx(agentId)]));
		}
	} else {
		res.send(JSON.stringify(agents));         
	}
});

function getNewId () {
	for (var i = 0; i < agents.length + 1; i++) {
		var isValid = true;
		for (var j = 0; j < agents.length; j++) {
			if (agents[j].id == i) {
				isValid = false;
			}
		}
		if (isValid) return i;
	}
}

router.get('/initialize/:lat/:lng', function(req, res) {
	var id = getNewId();
	var lat = parseFloat(req.params.lat);
	var lng = parseFloat(req.params.lng);
	var agent = new model.Agent(id, lat, lng);
	agents.push(agent);
	res.send(JSON.stringify(agent));
});

router.get('/remove/:agentId', function(req, res) {
	var agentId = req.params.agentId;
	var idx = getAgentIdx(agentId);
	var removed = agents.splice(idx, 1);
	winston.log('info', 'removed ' + removed);
});

function distanceBetween(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}

function canCommunicate(toAgentIdx, fromAgentIdx) {
	var distance = distanceBetween(agents[toAgentIdx].lat, agents[toAgentIdx].lng, agents[fromAgentIdx].lat, agents[fromAgentIdx].lng);
	return distance <= maxComDistance; 
}

router.get('/communicate/:fromAgent/:toAgent/:message', function(req, res) {
	var fromAgentId = parseInt(req.params.fromAgent, 10);
	var toAgentId = parseInt(req.params.toAgent, 10);
	var message = req.params.message;
	var fromAgentIdx = getAgentIdx(fromAgentId);
	var toAgentIdx = getAgentIdx(toAgentId);
	if (fromAgentIdx < 0 || toAgentIdx < 0) {
		res.status(422).send('bad agent index');
	} else {
		var timestamp = new Date();
		winston.log('debug', 'comms from ' + fromAgentId + ' to ' + toAgentId + '');
		if (canCommunicate(fromAgentIdx, toAgentIdx)) {
			agents[toAgentIdx].mailbox.push(new model.Message(timestamp, fromAgentId, toAgentId, message));
			res.status(200).send("ok");
		} else {
			res.status(200).send("unreachable");
		}
	}
});

router.get('/broadcast/:fromAgent/:message', function(req, res) {
	var fromAgentId = parseInt(req.params.fromAgent, 10);
	var message = req.params.message;
	var fromAgentIdx = getAgentIdx(fromAgentId);
	var timestamp = new Date();
	var recipients = [];
	for (var i = 0; i < agents.length; i++) {
		if (i != fromAgentIdx) {
			if (canCommunicate(fromAgentIdx, i)) {
				var toAgentIdx = agents[i].id;
				recipients.push(agents[i].id);
				agents[i].mailbox.push(new model.Message(timestamp, fromAgentId, toAgentIdx, message));
			}
		}
	}
	var responseString = JSON.stringify(recipients);
	if (recipients.length > 0)
		winston.log('info', 'bcast from ' + fromAgentId + ' to ' + responseString + ': ' + message);
	res.send(responseString);
});

router.get('/updateLoc/:agentId/:lat/:lng', function(req,res) {
	var agentId = parseInt(req.params.agentId, 10);
	var lat = parseFloat(req.params.lat, 10);
	var lng = parseFloat(req.params.lng, 10);
	var agentIdx = getAgentIdx(agentId);
	agents[agentIdx].lat = lat;
	agents[agentIdx].lng = lng;
	winston.log('trace', 'Agent ' + agentId + ' is at (' + lat + ',' + lng + ')');
	res.status(200).send('ok');
});

router.post('/updateFlightplan', function(req, res) {
  var agentId = req.body.agentId;
  var flightplan = req.body.flightplan;
	var agentIdx = getAgentIdx(agentId);
	agents[agentIdx].flightplan = flightplan;
  /*
	console.log('id: ' + agentId + ' headed to  ');
	for (var i = 0; i < flightplan.length; i++) {
		console.log('   ' + flightplan[i].lat + ' , ' + flightplan[i].lng);
	}*/
	console.log('new flightplan for ' + agentId);
  res.send('ok');
});

router.get('/getMessages/:agentId/:flush?', function(req,res) {
	var agentId = req.params.agentId;
	var agentIdx = getAgentIdx(agentId);
	var s = "getting messages for " + agentId;
	res.send(JSON.stringify(agents[agentIdx].mailbox));
	if (req.params.flush) {
		s += " and flushing";
		agents[agentIdx].mailbox.length = 0;
	}
	winston.log('debug', s);
});

module.exports = router;
