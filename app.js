
/**
 * Module dependencies.
 */

var express = require('express')
  , md = require('github-flavored-markdown')
  , fs = require('fs')
  , directory = require('./middleware/directory.js')
  , http = require('http')
  , path = require('path');

var app = express();

var docdir;
if (process.argv.length===3) {
    docdir = path.normalize(path.resolve(process.argv[2]));
} else {
    console.log("Usage: node app.js docdir");
    process.exit();
}
console.log("Path: " + docdir);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
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

app.get(/\.(?:md|mkdn)$/, function (req, res) {
    if (~req.path.indexOf('\0')) {
        return res.send(403);
    }
    var filepath = path.normalize(path.join(docdir, req.path));
    if (0 != filepath.indexOf(docdir)) {
        return res.send(403);
    }

    var src = fs.readFileSync(filepath, 'utf-8');
    var html = md.parse(src);
    var title = (function () {
        var m = html.match(/<h1>([^<>]+)<\/h1>/);
        if (m) {
            return m[1];
        } else {
            return 'no title';
        }
    })();
    res.render('md', { html: html, title: title, paths: directory.makePathArray(req.path) });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
