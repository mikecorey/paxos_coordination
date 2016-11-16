var express = require('express');
var winston = require('winston');

var router = express.Router();

var model = require('../model/model'); 

var maxComDistance = .048;

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
    //console.log(e.stack);
    return -1;
}


router.get('/status/:agentId', function(req, res) {
    var agentId = parseInt(req.params.agentId, 10);
    winston.log('info', 'requesting agent ' + agentId);
    var returningAgent = agents[getAgentIdx(agentId)];
    if (typeof returningAgent === 'undefined') {
        res.status(404).send("not found");
    } else {
        res.status(200).send(JSON.stringify(agents[getAgentIdx(agentId)]));
    }
});

router.get('/status', function(req, res) {
   res.send(JSON.stringify(agents)); 
});

router.get('/initialize/:lat/:lng', function(req, res) {
    var id = agents.length;
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

function canCommunicate(toAgentIdx, fromAgentIdx) {
    var agentDistance = Math.sqrt(Math.pow(agents[toAgentIdx].lat - agents[fromAgentIdx].lat, 2) + Math.pow(agents[toAgentIdx].lng - agents[fromAgentIdx].lng, 2)); 
    var result = agentDistance <= maxComDistance; 
    return result;
}

router.get('/communicate/:fromAgent/:toAgent/:message', function(req, res) {
   var fromAgentId = parseInt(req.params.fromAgent, 10);
   var toAgentId = parseInt(req.params.toAgent, 10);
   var message = req.params.message;
   var fromAgentIdx = getAgentIdx(fromAgentId);
   var toAgentIdx = getAgentIdx(toAgentId);
   var timestamp = new Date();
   winston.log('debug', 'comms from ' + fromAgentId + ' to ' + toAgentId + '');
   if (canCommunicate(fromAgentIdx, toAgentIdx)) {
       agents[toAgentIdx].mailbox.push(new model.Message(timestamp, fromAgentId, toAgentId, message));
       res.status(200).send("ok");
   } else {
       res.status(200).send("unreachable");
   }
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

router.get('/getMessages/:agentId/:flush?', function(req,res) {
    var agentId = req.params.agentId;
    var agentIdx = getAgentIdx(agentId);
    winston.log('info', 'getting messages for ' + agentId);
    res.send(JSON.stringify(agents[agentIdx].mailbox));
    if (req.params.flush) {
        winston.log('info', 'and flushing');
        agents[agentIdx].messages = [];
    }
});

module.exports = router;
