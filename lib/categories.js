var dial = require("./dial");

var isVerbose = false;

// get all and subcategories articles in a category
// for categories with more than 500 members, callback fires after all are retrieved
// if opts has a "onEach" function, fires on each batch of 500
var getAll = module.exports.all = function(category, opts, callback) {    
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}

	opts.limit = opts.limit || 500;
	opts["continue"] = opts["continue"] || "";
	opts.count = opts.count || 0;

	opts.data = opts.data || [];

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
		cmcontinue: opts["continue"]
	};

	if (opts.since) {
		params.cmsort = "timestamp";
		params.cmstart = opts.since;
	}

	dial(params, function(batch) {
		if (opts.onEach) {
			opts.onEach(batch.query.categorymembers, opts.data.length);
		}
		opts.count += batch.query.categorymembers.length;
		opts.data = opts.data.concat(batch.query.categorymembers);

		// if cmstart is specified, API returns a new cmstart val instead of a cmcontinue val
		if (batch["query-continue"] && batch["query-continue"].categorymembers.cmcontinue) {
			announce("Moving on to " + batch["query-continue"]["categorymembers"]["cmcontinue"]);
			opts["continue"] = batch["query-continue"]["categorymembers"]["cmcontinue"];
			getAll(category, opts, callback);
		} else if (batch["query-continue"] && batch["query-continue"].categorymembers.cmstart) {
			announce("Moving on to " + batch["query-continue"].categorymembers.cmstart);
			opts.since = batch["query-continue"].categorymembers.cmstart;
			getAll(category, opts, callback);
		} else {
			announce("Got " + opts.count + " entries for category " + category);
			callback(opts.data);
			return;
		}
	});
}

var getTree = module.exports.tree = function(category, callback, each, depth) {
	depth = depth || 0;
	getAll(category, function(members) {
		var count = members.length,
			branch = {
				name: category.replace("Category:", "").replace(/_/g, " "),
				pages: [],
				subcategories: []
			};

		members.forEach(function(member) {
			if (each) {
				each(category, member.title, depth);
			}
			if (member.ns === 0) {
				count -= 1;
				branch.pages.push(member.title);
			} else if (member.ns === 14) {
				getTree(member.title, function(data) {
					count -= 1;
					branch.subcategories.push(data);
					if (count === 0) {
						callback(branch);
					}
				}, each, depth + 1);
			} else {
				count -= 1;
			}
		});
		if (count === 0) {
			callback(branch);
		}
	});
}

// get revisions to pages using a category as a generator
var getGenerator = module.exports.generator = function(category, opts, callback) {
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}

	opts.limit = opts.limit || 500;
	opts["continue"] = opts["continue"] || "";

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
		gcmcontinue: opts["continue"]
	};

	dial(params, function(revs) {
		callback(revs.query.pages);

		// if there's another page of results, get that too
		if (revs["query-continue"]) {
			announce("Moving on to " + revs["query-continue"]["categorymembers"]["gcmcontinue"]);
			opts["continue"] = revs["query-continue"]["categorymembers"]["gcmcontinue"];
			revisionsByCategory(category, opts, callback);
		} else {
			announce("Finished getting category revision times for " + category);
			if (opts.onComplete) {
				opts.onComplete();
			}
		}
	});
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