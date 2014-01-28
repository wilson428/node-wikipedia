var dc = require("downcache"),
	request = require("request"),
	urlparse = require("url"),
	log = require("npmlog");

// dial the Wikipedia API, fire callback on result
module.exports = function(params, opts, callback) {
	params.format = "json";
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}
	var url = "http://en.wikipedia.org/w/api.php" + urlparse.format({ query: params });
	log.verbose(url);

	if (opts.cache) {
		var cacheopts = {
			json: true,
			dir: opts.cache
		};
		dc(url, cacheopts, function(json) {
			callback(json);
		});
	} else {
		request(url, { json: true }, function(err, resp, body) {
			if (err) {
				console.log(url, err);
				return;
			} else {
				callback(body);
			}
		});
	}
}