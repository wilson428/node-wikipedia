var wikipedia = require("node-wikipedia"),
	fs = require("fs");

wikipedia.categories.tree(
	"Major_League_Baseball_teams",
	function(tree) {
		fs.writeFileSync("output/teams.json", JSON.stringify(tree, null, 2));
	},
	function(page, category, depth) {
		//console.log(page, category, depth);
	} 
);