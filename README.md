node-wikipedia
==============

Node.js wrapper for the [Wikipedia API](http://en.wikipedia.org/w/api.php)

[![Build Status](https://travis-ci.org/wilson428/node-wikipedia.png)](https://travis-ci.org/wilson428/node-wikipedia)

#Installation

	npm install node-wikipedia

#Demo

	var wikipedia = require("node-wikipedia");

	wikipedia.page.data("Clifford_Brown", { content: true }, function(response) {
		// structured information on the page for Clifford Brown (wikilinks, references, categories, etc.)
	});

	wikipedia.revisions.all("Miles_Davis", { comment: true }, function(response) {
		// info on each revision made to Miles Davis' page
	});

	wikipedia.categories.tree(
		"Philadelphia_Phillies",
		function(tree) {
			//nested data on the category page for all Phillies players
		}
	);

#Philosophy 

The [MediaWiki API](http://en.wikipedia.org/w/api.php) is wonderfully permissive and horribly documented. This is a lightweight wrapper. In addition to providing a basic interface for making HTTP requests to the API, it bundles some requests so that one needn't bother with pagination and so forth.

#Under the Hood
`dial.js` makes API requests, accepting parameters as an object, options as an object, and a callback.

#License
This script is provided free and open-source under the MIT license. If you use it, you are politely encouraged to link to this repo.