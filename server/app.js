var express = require('express');
var KKBox = require('./KKBox');
var app = express();

app.get('/search', function (req, res) {
	if (typeof req.query.term === 'undefined') {
		return res.sendStatus(404);
	}
	if (typeof req.query.page === 'undefined') { req.query.page = 1 }

	KKBox.searchAlbum(req, req.query.term, req.query.page).then(r => {
		return res.send(r);
	});
});

app.get('/album', function(req, res) {
	if (typeof req.query.path === 'undefined') {
		return res.sendStatus(404);
	}

	KKBox.getAlbum(req.query.path).then(r => {
		return res.send(r);
	});
});

app.listen(3000, function () {
	console.log('KKBox middleman started');
});
