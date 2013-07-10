#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

/* Taken from restler example */
var checkUrl = function(urlstr, checksfile) {
    rest.get(urlstr).on('complete', function(result) {
	if (result instanceof Error) {
	    console.log('Error: ' + result.message);
	    this.retry(5000); // try again after 5 sec
	} else {
	    //process checks
	    //console.log('checkUrl results: ' + result);
	    $ = cheerio.load(result);
	    console.log('checkUrl $: ' + $);
	    var checks = loadChecks(checksfile).sort();
	    console.log('checkUrl checks: ' + checks);
	    var out = {};
	    for (var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	    }
	    console.log('checkUrl out' + out);
	    return out;
	}
    });
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // https://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'External url to be checked')
    .parse(process.argv);
    if(program.url) {
        console.log('program.url: ' + program.url);
        //var tmpdata = loadUrl(program.url);
        //console.log('tmpdata: ' + tmpdata);
        //var tmpfile = fs.writeFile('tmpfile',tmpdata);
        //var checkJson = checkHtmlFile('tmpfile', program.checks);
        var checkJson = checkUrl(program.url, program.checks);
    } else {
        var checkJson = checkHtmlFile(program.file, program.checks);
    }
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log('outJson: ' + outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkUrl = checkUr;
}
