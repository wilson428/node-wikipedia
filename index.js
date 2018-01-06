module.exports.categories = require(__dirname + "/lib/categories");
module.exports.revisions = require(__dirname + "/lib/revisions");
module.exports.page = require(__dirname + "/lib/page");
module.exports.random = require("./lib/random");
module.exports.setEndpoint = function(url){
    require(__dirname +"/lib/dial").endpoint = url
}