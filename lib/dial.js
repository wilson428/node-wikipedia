var downcache = require("downcache"),
	request = require("request"),
	urlparse = require("url"),
	log = require("npmlog");


module.exports.endpoint = "http://en.wikipedia.org/w/api.php"
// dial the Wikipedia API, fire callback on result
module.exports.dial = function(params, opts, callback) {
	params.format = "json";
	//params.lang = params.lang || "en";
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}
	var url = module.exports.endpoint + urlparse.format({ query: params });
	log.verbose(url);

	if (opts.cache) {
		if (typeof opts.cache === "string") {
			opts.cache = {
				dir: opts.cache
			};			
		}
		opts.cache.json = true;
		downcache(url, opts.cache, function(err, json) {
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