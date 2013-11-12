// thin wrapper for Wikipedia API

var sys = require('sys'),
	request = require('request'),
	urlparse = require('url'),
	dc = require("downcache"),
    d3 = require("d3");

var wikipedia = module.exports = exports;

var isVerbose = false; 

var dateFormat = d3.time.format("%Y-%m-%dT%H:%M:%SZ");

// date in Wiki or JS format, delta in days
function addDate(date, delta) {
    if (typeof date === "string") {
        var date = dateFormat.parse(date);
    }
    var next = new Date(date.getTime() + 1000 * 3600 * 24 * delta);
    return dateFormat(next);
}
module.exports.addDate = addDate;


// make a call to Wikipedia API
var call = function(params, opts, callback) {
	params.format = "json";
	if (arguments.length < 3) {
		callback = opts;
		opts = {
			cache: false
		};
	}
	var url = "http://en.wikipedia.org/w/api.php" + urlparse.format({ query: params });
	announce(url);
	if (opts.cache) {
		var cacheopts = {
			json: true,
			dir: ""
		};

		if (opts.local) {
			cacheopts.dir = "/Users/cwilson1130/Desktop/wikipedia/";
		}

		dc(url, cacheopts, function(json) {
			//console.log(typeof json);
			callback(json);
		});
	} else {
		request(url, { json: true }, function(err, resp, body) {
			if (err) {
                console.log(url);
                console.log(err);
                return;
            } else {
    			callback(body);
            }
		});
	}
}
module.exports.call = call;

// get all articles in a category
var getCategory = function(category, opts, callback) {
    if (arguments.length < 3) {
        callback = opts;
        opts = {};
    }

    opts.limit = opts.limit || 500;
    opts.continue = opts.continue || "";
    opts.count = opts.count || 0;

    if (category.indexOf("Category:") == -1) {
        category = "Category:" + category
    }
    
    var params = {
        format: "json",
        action: "query",
        list: "categorymembers",
        cmtitle: category,
        cmprop: "ids|title|type|timestamp",
        cmlimit: opts.limit,
        cmcontinue: opts.continue
    };

    if (opts.since) {
        params.cmsort = "timestamp";
        params.cmstart = opts.since;
    }

    call(params, store);

    function store(people) {
        callback(people.query.categorymembers);
        opts.count += people.query.categorymembers.length;
        // if cmstart is specified, API returns a new cmstart val instead of a cmcontinue val
        if (people["query-continue"] && people["query-continue"].categorymembers.cmcontinue) {
            announce("Moving on to " + people["query-continue"]["categorymembers"]["cmcontinue"]);
            opts.continue = people["query-continue"]["categorymembers"]["cmcontinue"];
            getCategory(category, opts, callback);
        } else if (people["query-continue"] && people["query-continue"].categorymembers.cmstart) {
            announce("Moving on to " + people["query-continue"].categorymembers.cmstart);
            opts.since = people["query-continue"].categorymembers.cmstart;
            getCategory(category, opts, callback);
        } else {
            announce("Got " + opts.count + " entries for category " + category);
            if (opts.onComplete) {
                opts.onComplete();
            }
        }
    }
}
module.exports.getCategory = getCategory;


// get revisions to pages using a category as a generator
var revisionsByCategory = function(category, opts, callback) {
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}

    opts.limit = opts.limit || 500;
    opts.continue = opts.continue || "";

    if (category.indexOf("Category:") == -1) {
        category = "Category:" + category
    }
    
    //http://en.wikipedia.org/w/api.php?format=json&prop=revisions&action=query&generator=categorymembers&gcmtitle=Category:Living_people&gcmlimit=500
    var params = {
        format: "json",
        action: "query",
        prop: "revisions",
        generator: "categorymembers",
        gcmtitle: category,
        gcmlimit: opts.limit,
        gcmcontinue: opts.continue
    };

    call(params, go_on);

	function go_on(revs) {
        callback(revs.query.pages);

		// if there's another page of results, get that too
        if (revs["query-continue"]) {
            announce("Moving on to " + revs["query-continue"]["categorymembers"]["gcmcontinue"]);
            opts.continue = revs["query-continue"]["categorymembers"]["gcmcontinue"];
            revisionsByCategory(category, opts, callback);
        } else {
            announce("finished getting category revision times for " + category);
        	if (opts.onComplete) {
        		opts.onComplete();
        	}
        }
    }
}

module.exports.revisionsByCategory = revisionsByCategory;

// get revisions to pages using a list of names
var revisionsByNames = function(names, opts, callback) {
    if (arguments.length < 3) {
        callback = opts;
        opts = {};
    }

    if (typeof names === "object") {
        names = names.join("|");
    }
    
    //http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=API|Main%20Page&rvprop=timestamp|user|comment|content
    var params = {
        format: "json",
        action: "query",
        prop: "revisions",
        titles: names,
        rvprop: opts.content ? "ids|timestamp|content" : "ids|timestamp"
    };
    call(params, callback);
}

module.exports.revisionsByNames = revisionsByNames;


var parse = function(revid, opts, callback) {
    if (arguments.length < 3) {
        callback = opts;
        opts = {};
    }

    var params = {
        action: "parse",
        oldid: revid,
        prop: "categories|externallinks|links|text"
    }
    call(params, opts, callback);
}
module.exports.parse = parse;


//http://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=Barack_Obama&rvprop=timestamp|user|tags&rvend=2012-11-03T00:00:00Z&rvstart=2012-11-04T00:00:00Z


// retrieves all the revisions for a page, optionally between two dates.
// Unlike other functions here, does NOT fire callback until all results retrieved
var revisionsByPage = function(page, opts, callback, data) {
    if (arguments.length < 3) {
        callback = opts;
        opts = {};
    }

    if (!data) {
        data = [];
    }

    opts.continue = opts.continue || null;

    var params = {
        format: "json",
        action: "query",
        prop: "revisions",
        rvlimit: 500,
        titles: page
    };

    if (opts.continue) {
        params.rvcontinue = opts.continue;
    }

    if (opts.until) {
        params.rvstart = addDate(opts.until, 0);
    }
    if (opts.from) {
        params.rvend = addDate(opts.from, 0);
    } else if (opts.until && opts.span) {
        params.rvend = addDate(opts.until, -parseInt(opts.span, 10));
    }

    call(params, opts, more);    

    function more(response) {
        if (response.query.pages)  {
            var revisions = d3.values(response.query.pages)[0].revisions;
            if (revisions) {
                data = data.concat(revisions);
            } else {
                announce("Didn't find anything for this");
            }
        }
        if (response['query-continue']) {
            opts.continue = response['query-continue'].revisions.rvcontinue;
            revisionsByPage(page, opts, callback, data);
        } else {
            callback(data);
        }
    }
}

module.exports.revisionsByPage = revisionsByPage;


function announce(message) {
	if (isVerbose) {
		console.log(message);
	}
}

module.exports.verbose = function() {
	isVerbose = true;
	dc = dc.verbose();
    return wikipedia;
};
