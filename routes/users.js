var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('yep user');
  res.io.emit("socketToMe", "users");
  res.send('respond with a resource.');
});

router.post('/testPost', function(req, res) {
  var parm1 = req.body.parm1;
  var parm2 = req.body.parm2;
  console.log('post: ' + parm1 + ' and ' + parm2);
  res.send('got ' + parm1 + ' & ' + parm2);
});

module.exports = router;