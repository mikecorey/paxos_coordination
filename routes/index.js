var express = require('express');
var winston = require('winston');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'ExprCBAess' });
});

router.get('/resetSim', function(req, res) {
	collects = [];
	agents = [];
	winston.log('info', 'SIMULATION RESET!!!');
	res.send("reset!!!");
});

module.exports = router;
