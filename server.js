var express = require('express');
var validator = require('validator');
var path = require('path');

var app = express();
app.set('views', './views');
app.set('view engine', 'pug');

var port = process.env.PORT || 8080;

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/url-shortener';

var urlsCollection;

MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    
    urlsCollection = db.collection('urls');
    
    app.listen(port, function() {
        console.log('Listening on port ' + port);
    });
});


app.get('/', function(req, res) {
    res.render('index', { app_url: process.env.APP_URL });
});

app.get('/new/:url(*)', function(req, res) {
    var url = req.params.url;
    
    var urlObj = {};
    
    if (validator.isURL(url, { require_protocol: true })) {
        
        urlObj = {
            original_url: url,
            url_id: getRandomIntInclusive(1000, 9999)
        };
        
        urlsCollection.insertOne(urlObj, function(err, result) {
            if (err) throw err; 
            
            res.send({
                original_url: urlObj.original_url,
                short_url: process.env.APP_URL + urlObj.url_id
            });
        });

    } else {
        res.send('Invalid Input');
    }
});

app.get('/:url', function(req, res) {
    
    var url_id = req.params.url;
    var urlFind;
    var urlObj;
    
    if (validator.isNumeric(url_id) && url_id.length === 4) {
    
        searchForUrl(url_id, function(docs) {
            if (docs.length !== 0) {
                urlObj = docs[0];
                res.redirect(urlObj.original_url);
            } else {
                res.send('URL not found.');
            }
        });
    
    } else {
        res.send('Invalid Input');
    }
});

app.get('/:url*', function(req, res) {
   res.send('Invalid Input'); 
});



function searchForUrl(url_id, callback) {

    urlsCollection.find({url_id: +url_id}, {_id: 0}).toArray(function(err, docs) {
        if (err) throw err;
        
        callback(docs);
    });    
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}