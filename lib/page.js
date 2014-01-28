var dial = require("./dial"),
	cheerio = require("cheerio");

var isVerbose = false;

var getData = module.exports.data = function(page, opts, callback) {
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}

	var params = {
		action: "parse",
		//oldid: revid,
		page: page,
		prop: opts.content ? "categories|externallinks|links|text" : "categories|externallinks|links"
	}

	if (opts.redirects || typeof opts.redirects === "undefined") {
		params.redirects = true;
	}

	dial(params, function(d) {
		// include the original page as second parameter in case redirect changed it
		callback(d.parse, page);
	});
}

module.exports.image = function(page, callback) {
	getData(page, function(data) {
		if (!data || !data.parse) {
			return false;
		}
		var $ = cheerio.load("<html><head></head><body>" + data.parse.text['*'] + "</body></html>"),
			images = $(".infobox img");

		if (images.length > 0) {
			callback(images[0].attribs.src);
		} else {
			console.log("No image found for " + page);
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