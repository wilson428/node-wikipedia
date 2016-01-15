var dial = require("./dial");

var getData = module.exports = function(opts, callback) {
	if (arguments.length == 1) {
		callback = opts;
		opts = {};
	}

	var params = {
		action: "query",
		list: "random",
		rnlimit: opts.n || 10,
		rnnamespace: 0,
		lang: opts.lang || 'en'
	}

	dial(params, function(response, url) {
		callback(response, url);
	});
}

