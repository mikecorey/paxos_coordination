var express = require('express');
var winston = require('winston');

var router = express.Router();

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

var agents = new Array();

var maxComDistance = .048;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ExprAess' });
});

router.get('/agent/status/:agentId', function(req, res) {
   var agentId = parseInt(req.params.agentId, 10);
   winston.log('info', 'requesting agent ' + agentId);
   res.status(200).send(JSON.stringify(agents[agentId]));
});

router.get('/agent/status', function(req, res) {
   res.send(JSON.stringify(agents)); 
});

function canCommunicate(toAgent, fromAgent) {
    var agentDistance = Math.sqrt(Math.pow(agents[toAgent].lat - agents[fromAgent].lat, 2) + Math.pow(agents[toAgent].lng - agents[fromAgent].lng, 2)); 
    var result = agentDistance <= maxComDistance; 
    winston.log('debug', 'Coms from ' + fromAgent + ' to ' + toAgent + ': ' + result);
    return result;
}

router.get('/agent/initialize/:lat/:lng', function(req, res) {
    var id = agents.length;
    var lat = parseFloat(req.params.lat);
    var lng = parseFloat(req.params.lng);
    var agent = new Agent(id, lat, lng);
    agents.push(agent);
    res.send(JSON.stringify(agent));
});

/*
router.get('/agent/remove/:agentId', function(req, res) {
    var x = agents.findIndex(x => x.agentId = req.params.agentId);
    
});*/

router.get('/list', function(req, res) {
   res.render('agents', {agentArray : JSON.stringify(agents)}); 
});


router.get('/agent/communicate/:fromAgent/:toAgent/:message', function(req, res) {
   var fromAgentId = parseInt(req.params.fromAgent, 10);
   var toAgentId = parseInt(req.params.toAgent, 10);
   var message = req.params.message;
   var timestamp = new Date();
   winston.log('debug', 'comms from ' + fromAgentId + ' to ' + toAgentId + '');
   if (canCommunicate(fromAgentId, toAgentId)) {
       agents[toAgentId].mailbox.push(new Message(timestamp, fromAgentId, toAgentId, message));
       res.status(200).send("message sent");
   } else {
       res.status(404).send("can't send");
   }
});

router.get('/agent/updateLoc/:agentId/:lat/:lng', function(req,res) {
   var agentId = parseInt(req.params.agentId, 10);
   var lat = parseFloat(req.params.lat, 10);
   var lng = parseFloat(req.params.lng, 10);
   agents[agentId].lat = lat;
   agents[agentId].lng = lng;
   winston.log('trace', 'Agent ' + agentId + ' is at (' + lng + ',' + lng + ')');
   res.status(200).send('ok');
});

router.get('/agent/getMessages/:agentId/:flush?', function(req,res) {
    var agentId = req.params.agentId;
    winston.log('getting messages for ' + agentId);
    res.send(JSON.stringify(agents[agentId].mailbox));
});



/*tollolololol*/

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
 
/* end trollolololol */

module.exports = router;
