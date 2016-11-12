var express = require('express');
var winston = require('winston');

var router = express.Router();

var trololol = false;
var maxComDistance = .048;

/* MODEL SHOULD BE SOMEWHERE ELSE... */

function Agent (id, lat, lng) {
    console.log('made an agent');
    this.id = id;
    this.lat = lat;
    this.lng = lng;
    this.mailbox = new Array();
}

function Message (timestamp, fromAgent, toAgent, message) {
    this.timestamp = timestamp;
    this.fromAgent = fromAgent;
    this.toAgent = toAgent;
    this.message = message;
}

function Collect (lat, lng) {
    this.lat = lat;
    this.lng = lng;
}

var collects = [];

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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ExprBAess' });
});

router.get('/resetSim', function(req, res) {
    collects = [];
    agents = [];
    winston.log('info', 'SIMULATION RESET!!!');
});

router.get('/agent/status/:agentId', function(req, res) {
    var agentId = parseInt(req.params.agentId, 10);
    winston.log('info', 'requesting agent ' + agentId);
    var returningAgent = agents[getAgentIdx(agentId)];
    if (typeof returningAgent === 'undefined') {
        res.status(404).send("not found");
    } else {
        res.status(200).send(JSON.stringify(agents[getAgentIdx(agentId)]));
    }
});

router.get('/agent/status', function(req, res) {
   res.send(JSON.stringify(agents)); 
});

router.get('/agent/initialize/:lat/:lng', function(req, res) {
    var id = agents.length;
    var lat = parseFloat(req.params.lat);
    var lng = parseFloat(req.params.lng);
    var agent = new Agent(id, lat, lng);
    agents.push(agent);
    res.send(JSON.stringify(agent));
});

router.get('/agent/remove/:agentId', function(req, res) {
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

router.get('/agent/communicate/:fromAgent/:toAgent/:message', function(req, res) {
   var fromAgentId = parseInt(req.params.fromAgent, 10);
   var toAgentId = parseInt(req.params.toAgent, 10);
   var message = req.params.message;
   var fromAgentIdx = getAgentIdx(fromAgentId);
   var toAgentIdx = getAgentIdx(toAgentId);
   var timestamp = new Date();
   winston.log('debug', 'comms from ' + fromAgentId + ' to ' + toAgentId + '');
   if (canCommunicate(fromAgentIdx, toAgentIdx)) {
       agents[toAgentIdx].mailbox.push(new Message(timestamp, fromAgentId, toAgentId, message));
       res.status(200).send("ok");
   } else {
       res.status(200).send("unreachable");
   }
});


router.get('/agent/updateLoc/:agentId/:lat/:lng', function(req,res) {
   var agentId = parseInt(req.params.agentId, 10);
   var lat = parseFloat(req.params.lat, 10);
   var lng = parseFloat(req.params.lng, 10);
   var agentIdx = getAgentIdx(agentId);
   agents[agentIdx].lat = lat;
   agents[agentIdx].lng = lng;
   winston.log('trace', 'Agent ' + agentId + ' is at (' + lat + ',' + lng + ')');
   res.status(200).send('ok');
});

router.get('/agent/getMessages/:agentId/:flush?', function(req,res) {
    var agentId = req.params.agentId;
    var agentIdx = getAgentIdx(agentId);
    winston.log('info', 'getting messages for ' + agentId);
    res.send(JSON.stringify(agents[agentIdx].mailbox));
    if (req.params.flush) {
        winston.log('info', 'and flushing');
        agents[agentIdx].messages = [];
    }
});

router.get('/collects/add/:lat/:lng', function(req,res) {
   var lat = parseFloat(req.params.lat, 10);
   var lng = parseFloat(req.params.lng, 10);
   var col = new Collect(lat, lng);
   collects.push(col);
   winston.log('info', 'Collection added at (' + lat + ',' + lng + ')');
   res.status(200).send('ok');
});

router.get('/collects/remove/:lat/:lng', function(req,res) {
   var lat = parseFloat(req.params.lat, 10);
   var lng = parseFloat(req.params.lng, 10);
   for (var i = 0; i < collects.length; i++) {
       if (collects[i].lat == lat && collects[i].lng == lng) {
           collects.splice(i, 1);
       }
   }
   winston.log('info', 'Collection removed at (' + lat + ',' + lng + ')');
   res.status(200).send('ok');
});

router.get('/collects/show/:lat?/:lng?', function(req, res) {
   var lat = parseFloat(req.params.lat, 10);
   var lng = parseFloat(req.params.lng, 10);
   res.send(JSON.stringify(collects)); 
});

/*tollolololol*/
if (trololol) {
    router.get('/someunexista*', function(req,res) {
        res.status(404).send('not found');
    })

    function randomString(len) {
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        var returnable = '';
        for (var i = 0; i < len; i++) {
            returnable += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return returnable;
    }

    router.use(function(req, res) {
        var date = new Date();
        if (date.getMinutes() / 10 % 2 == 1)  {
            res.redirect('http://' + req.headers.host + '/' + randomString(20));
        } else {
            res.status(200).send('ok!');
        }
    });
}
/* end trollolololol */

module.exports = router;
