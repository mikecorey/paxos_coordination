var express = require('express');
var winston = require('winston');

var router = express.Router();

var trololol = false;


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
