var dial = require("./dial"),
	cheerio = require("cheerio");

var getData = module.exports.data = function(page, opts, callback) {
	if (arguments.length < 3) {
		callback = opts;
		opts = {};
	}

	var params = {
		action: "parse",
		//oldid: revid,
		page: page,
		prop: "categories|externallinks|links",
		lang: opts.lang || 'en'
	}

	if (opts.content) {
		params.prop += "|text";
	}

	if (opts.wikitext) {
		params.prop += "|wikitext";
	}

	if (opts.redirects || typeof opts.redirects === "undefined") {
		params.redirects = true;
	}

	dial(params, function(d, url) {
		// include the original page as second parameter in case redirect changed it
		callback(d.parse, page, url);
	});
}

module.exports.image = function(page, callback) {
	getData(page, { content: true }, function(data) {
		if (!data) {
			return false;
		}
		var $ = cheerio.load("<html><head></head><body>" + data.text['*'] + "</body></html>"),
			images = $(".infobox img");

		if (images.length > 0) {
			callback(images[0].attribs.src);
		} else {
			console.log("No image found for " + page);
		}
	});
}

module.exports.description = function(page, callback) {
	var pattern = new RegExp("SHORT DESCRIPTION ?= ?(.+)", "i");

	getData(page, { wikitext: true }, function(data, url) {
		if (!data) {
			return false;
		}

		var description = pattern.exec(data.wikitext['*']);

		if (description && description.length > 1) {
			var desc = description[1];
			callback(parseWikiText(description[1]));
		} else {
			callback(null);
		}

	});
}

function parseWikiText(s) {
	// e.g. {{Persondata|NAME=Gordh, Gordon|ALTERNATIVE NAMES=|SHORT DESCRIPTION=Entomologist|DATE OF BIRTH=1945|PLACE OF BIRTH=[[USA]]|DATE OF DEATH=|PLACE OF DEATH=USA}}
    s = s.split(/\|[A-Z ]{5,100}/)[0];

	var pattern = /\[\[(.*?)\]\]/g,
		output = s,
	    m;

	// e.g. | SHORT DESCRIPTION=[[United States Senate|U.S. Senator]] from [[Massachusetts]], [[John Kerry presidential campaign, 2004|2004 presidential nominee]] for the [[Democratic Party (United States)|Democratic Party]]
	while (m = pattern.exec(s)) {
	    if (m[1].split("|").length > 1) {
	        var sub = m[1].split("|")[1];    
	    } else {
	        var sub = m[1];    
	    }
	    output = output.replace(m[0], sub);   
	}	
	return output.replace(/\s+/g, " ");
}