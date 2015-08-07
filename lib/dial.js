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
	var url = "http://" + params.lang + ".wikipedia.org/w/api.php" + urlparse.format({ query: params });
	log.verbose(url);

	if (opts.cache) {
		if (typeof opts.cache === "string") {
			opts.cache = {
				dir: opts.cache
			};			
		}
		opts.cache.json = true;
		dc(url, opts.cache, function(err, json) {
			callback(json, url);
		});
	} else {
		request(url, { json: true }, function(err, resp, body) {
			if (err) {
				log.error(url, err);
				return;
			} else {
				callback(body, url);
			}
		});
	}
}