var express = require('express')
  , md = require('github-flavored-markdown')
  , fs = require('fs')
  , directory = require('./src/middleware/directory.js')
  , http = require('http')
  , optimist = require('optimist')
  , path = require('path');

var app = module.exports = express();
var argv = optimist
    .alias('p', 'port')
    .argv;

var docdir;
if (argv._.length===1) {
    docdir = path.normalize(path.resolve(argv._[0]));
} else {
    console.log("Usage: node app.js docdir");
    process.exit();
}
if (!module.parent) {
    console.log("Path: " + docdir);
}

app.configure(function(){
  app.set('port', process.env.PORT || argv.port || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(function (req, res, next) {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(directory(docdir));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

if (!module.parent || module.parent.exports.mdpad_loader) {
    http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
}
