var dial = require("./dial").dial,
	log = require("npmlog"),
	fs = require("fs");

var values = function(map) {
  var values = [];
  for (var key in map) values.push(map[key]);
  return values;
};

var getRevisions = function(params, opts, callback) {
	dial(params, opts, function(response) {
		opts.data = opts.data || [];

		if (typeof response == "string") {
			response = JSON.parse(response);
		}

		if (!response || !response.query) {
			log.error("Couldn't read response:", typeof response, JSON.stringify(params));
			//fs.writeFileSync("/Users/cwilson1130/Desktop/wikipedia/errors/" + params.titles + ".json", JSON.stringify(response, null, 2));
			return false;
		}
		if (response.query.pages)  {
			var revisions = values(response.query.pages)[0].revisions;
			if (revisions) {
				opts.data = opts.data.concat(revisions);
			} else {
				log.warn("Didn't find anything for " + params.titles);
			}
		}
		if (response['continue']) {
			opts["continue"] = response.continue.rvcontinue;
			params.rvcontinue = response.continue.rvcontinue;
			getRevisions(params, opts, callback);
		} else {
			callback(opts.data);
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
		rvprop: "ids|timestamp|user"
	};

	if (opts.content) {
		params.rvprop += "|content";
	}

	if (opts.wikitext) {
		params.rvprop += "|wikitext";
	}

	if (opts.comment) {
		params.rvprop += "|comment";
	}

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
			rvprop: opts.content ? "ids|timestamp|contentmodel=wikitext|content" : "ids|timestamp"
		};		

		dial(params, function(resp) {			
			for (var page in resp.query.pages) {
				console.log(resp.query.pages[page]);
				callback(resp.query.pages[page]);
			}
		});
	}
}