node-wikipedia
==============

Node.js wrapper for the [Wikipedia API](http://en.wikipedia.org/w/api.php)

#Installation

	npm install git+ssh://git@github.com:TimeMagazine/node-wikipedia.git

#Demo

	var wikipedia = require("wikipedia");


#Philosophy 

The [MediaWiki API](http://en.wikipedia.org/w/api.php) is wonderfully permissive and horribly documented. This is a lightweight wrapper. In addition to providing a basic interface for making HTTP requests to the API, it bundles some requests so that one needn't bother with pagination and so forth.

#Above the Hood

Instantiate the module the usual way:

	var wikipedia = require("wikipedia");

There are currently three branches of the module:

###

`wikipedia.categories(category, opts, callback)`

`wikipedia.page(category, opts, callback)`

`wikipedia.revisions(category, opts, callback)`

#Under the Hood
`dial.js` makes API requests, accepting parameters as an object, options as an object, and a callback.

