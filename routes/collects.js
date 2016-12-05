var express = require('express');
var winston = require('winston');

var router = express.Router();

var model = require('../model/model'); 

var collects = [];
var viewDistance = 0.048;

router.get('/add/:lat/:lng', function(req,res) {
	var lat = parseFloat(req.params.lat, 10);
	var lng = parseFloat(req.params.lng, 10);
	var col = new model.Collect(lat, lng);
	collects.push(col);
	winston.log('info', 'Collection added at (' + lat + ',' + lng + ')');
	res.status(200).send('ok');
});

router.get('/remove/:lat/:lng', function(req,res) {
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

function distanceBetween (x1,y1,x2,y2) {
	return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
}

router.get('/show/:lat?/:lng?', function(req, res) {
	if (req.params.lat && req.params.lng) {
		var lat = parseFloat(req.params.lat, 10);
		var lng = parseFloat(req.params.lng, 10);
		var result = [];
		for (var i = 0; i < collects.length; i++) {
			var currentCollect = collects[i];
			if (distanceBetween(currentCollect.lat, currentCollect.lng, lat, lng) < viewDistance) {
				result.push(currentCollect);
			}
		}
		res.send(JSON.stringify(result));
	} else {
		res.send(JSON.stringify(collects)); 
	}
});



module.exports = router;