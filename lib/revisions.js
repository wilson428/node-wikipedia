var dial = require("./dial");

var isVerbose = false;

var getRevisions = function(params, opts, callback) {
	dial(params, opts, function(response) {
		if (response.query.pages)  {
			var revisions = d3.values(response.query.pages)[0].revisions;
			if (revisions) {
				data = data.concat(revisions);
			} else {
				announce("Didn't find anything for this");
			}
		}
		if (response['query-continue']) {
			opts["continue"] = response['query-continue'].revisions.rvcontinue;
			getRevisions(params, opts, callback);
		} else {
			callback(data);
		}
	});
}

// retrieves all the revisions for a page, optionally between two dates (opts from/until).
// Does NOT fire callback until all results retrieved
module.exports.all = function(page, opts, callback) {
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}

	if (!opts.data) {
		opts.data = [];
	}

	opts["continue"] = opts["continue"] || null;

	var params = {
		format: "json",
		action: "query",
		prop: "revisions",
		rvlimit: 500,
		titles: page,
		rvprop: opts.content ? "ids|timestamp|content" : "ids|timestamp"
	};

	if (opts["continue"]) {
		params.rvcontinue = opts["continue"];
	}

	if (opts.until) {
		params.rvstart = addDate(opts.until, 0);
	}
	if (opts.from) {
		params.rvend = addDate(opts.from, 0);
	} else if (opts.until && opts.span) {
		params.rvend = addDate(opts.until, -parseInt(opts.span, 10));
	}

	getRevisions(params, opts, callback);
}


// get most recent revision to page or pages 
module.exports.one = function(pages, opts, callback) {
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}

	if (typeof pages === "string") {
		pages = [pages];
	}

	for (var i = 0; i < pages.length; i += 50) {	
		//http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=API|Main%20Page&rvprop=timestamp|user|comment|content
		var params = {
			format: "json",
			action: "query",
			prop: "revisions",
			rvparse: 1,
			titles: pages.slice(i, i + 50).join("|"),
			rvprop: opts.content ? "ids|timestamp|content" : "ids|timestamp"
		};

		dial(params, function(resp) {
			for (var page in resp.query.pages) {
				callback(resp.query.pages[page]);
			}
		});
	}
}

function announce(message) {
	if (isVerbose) {
		console.log(message);
	}
}

module.exports.verbose = function() {
	isVerbose = true;
	dc = dc.verbose();
	return this;
};