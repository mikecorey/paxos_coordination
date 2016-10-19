var express = require('express');
var winston = require('winston');

var router = express.Router();


var model = require('../models/model');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ExprAess' });
});




router.get('/agent/status/:agentId', function(req, res) {
   var agentId = parseInt(req.params.agentId, 10);
   winston.log('info', 'requesting agent ' + agentId);
   res.status(200).send(JSON.stringify(agents[agentId]));
});

function canCommunicate(toAgent, fromAgent) {
    var result = true;
    winston.log('debug', 'comm');
    return result;
}

router.get('/agent/initialize', function(req, res) {
    var locX = Math.floor(Math.random() * 10);
    var locY = Math.floor(Math.random() * 10);
    var agent = new model.Agent(locX, locY);
    model.agents.push(agent);
    res.send(JSON.stringify(agent));
});

/*
router.get('/agent/remove/:agentId', function(req, res) {
    var x = agents.findIndex(x => x.agentId = req.params.agentId);
    
});*/

router.get('/list', function(req, res) {
   res.render('agents', {agentArray : JSON.stringify(model.agents)}); 
});


router.get('/agent/communicate/:fromAgent/:toAgent/:message', function(req, res) {
   var fromAgentId = parseInt(req.params.fromAgent, 10);
   var toAgentId = parseInt(req.params.toAgent, 10);
   var message = req.params.message;
   var timestamp = new Date();
   winston.log('info', 'requesting agent');
   if (canCommunicate(fromAgentId, toAgentId)) {
       agents[toAgentId].mailbox.push(new Message(timestamp, fromAgentId, toAgentId, message));
       res.status(200).send("message sent");
   } else {
       res.status(404).send("can't send");
   }
});

router.get('/agent/updateLoc/:agentId/:locX/:locY', function(req,res) {
   var agentId = parseInt(req.params.agentId, 10);
   var locX = parseInt(req.params.locX, 10);
   var locY = parseInt(req.params.locY, 10);
   winston.log('info', 'Agent ' + agentId + ' is at (' + locX + ',' + locY + ')');
   res.status(200).send('ok');
});

router.get('/agent/getMessages/:agentId/:flush?', function(req,res) {
    var agentId = req.params.agentId;
    winston.log('getting messages for ' + agentId);
    res.send(JSON.stringify(agents[agentId].mailbox));
});



/*tollolololol*/

function randomString(len) {
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var returnable = '';
    for (var i = 0; i < len; i++) {
        returnable += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return returnable;
}

router.use(function(req, res) {
    console.log(req.headers.host);
    var date = new Date();
    if (date.getMinutes() / 10 % 2 == 1)  {
        res.redirect('http://' + req.headers.host + '/' + randomString(20));
    } else {
        res.status(200).send('ok!');
    }
 });
 
/* end trollolololol */

module.exports = router;
