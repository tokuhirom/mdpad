process.argv = ['node.js', 'app.js', '.'];

var assert = require('assert'),
    app = require('./app.js');

assert(app);
console.log("Compilation succeeded.");
