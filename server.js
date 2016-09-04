var express = require('express');
var validator = require('validator');
var path = require('path');

var app = express();
app.set('views', './views');
app.set('view engine', 'pug');

var port = process.env.PORT || 8080;

var urls = []; //use this array instead of MongoDB for now.


app.get('/', function(req, res) {
    res.render('index', { app_url: process.env.APP_URL });
});

app.get('/new/:url(*)', function(req, res) {
    var url = req.params.url;
    
    var urlObj = {};
    
    if (validator.isURL(url, { require_protocol: true })) {
        
        urlObj = {
            original_url: url,
            url_id: getUniqueUrlId()
        };
        
        urls.push(urlObj);
        
        res.send({
            original_url: urlObj.original_url,
            short_url: process.env.APP_URL + urlObj.url_id
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
    
        urlFind = searchForUrl(url_id);
        if (urlFind.length === 1) {
            urlObj = urlFind[0];
            res.redirect(urlObj.original_url);
        } else {
            res.send('URL not found.');
        }
    
    } else {
        res.send('Invalid Input');
    }
});

app.get('/:url*', function(req, res) {
   res.send('Invalid Input'); 
});

app.listen(port, function() {
    console.log('Listening on port ' + port);
});


function getUniqueUrlId() {
    var url_id;
    do {
        url_id = getRandomIntInclusive(1000, 9999);
    } while ( searchForUrl(url_id).length !== 0 );
    
    return url_id;
}

function searchForUrl(url_id) {
    return urls.filter( urlObj => urlObj.url_id === +url_id );
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}