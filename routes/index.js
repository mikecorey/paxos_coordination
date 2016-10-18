var express = require('express');
var router = express.Router();
var winston = require('winston');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ExprAess' });
});

router.get('/agent/:agentId', function(req, res) {
   var agentId = parseInt(req.params.agentId, 10);
   winston.log('info', 'requesting agent ' + agentId);
   res.status(200).send(' ' + agentId);
   
});



function canCommunicate(toAgent, fromAgent) {
    var result = true;
    winston.log('debug', 'comm');
    return result;
}


router.get('/communicate/:fromAgent/:toAgent/:message', function(req, res) {
   var fromAgentId = parseInt(req.params.fromAgent, 10);
   var toAgentId = parseInt(req.params.toAgent, 10);
   var message = req.params.message;
   winston.log('info', 'requesting agent');
   if (canCommunicate(fromAgentId, toAgentId)) {
       agent[toAgentId].mailbox.push({'from': fromAgentId, 'message': message})
       res.status(200).send("message sent");
   } else {
       res.status(404).send("can't send");
   }
});

router.get('/move/:agentId/:locX/:locY', function(req,res) {
   var agentId = parseInt(req.params.agentId, 10);
   var locX = parseInt(req.params.locX, 10);
   var locY = parseInt(req.params.locY, 10);
   winston.log('info', 'Agent ' + agentId + ' moving to (' + locX + ',' + locY + ')');
   res.status(200).send('ok');
});
/*
router.use(function(req, res) {
    res.redirect(301, 'http://127.0.0.1' + req.originalUrl);
});
*/
module.exports = router;
