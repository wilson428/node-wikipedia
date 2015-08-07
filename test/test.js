#!/usr/bin/env node

var wikipedia = require("../index"),
	fs = require("fs");

wikipedia.page.data("Clifford_Brown", { content: true }, function(response) {
	fs.writeFileSync(__dirname + "/output/Clifford_Brown.json", JSON.stringify(response, null, 2));
});

// Non-latin alphabets
wikipedia.page.data("Бакунин_Михаил_Александрович", { content: true, lang: 'ru' }, function(response) {
  fs.writeFileSync(__dirname + "/output/Бакунин_Михаил_Александрович.json", JSON.stringify(response, null, 2));
});

wikipedia.revisions.all("Miles_Davis", { comment: true }, function(response) {
	fs.writeFileSync(__dirname + "/output/Miles_Davis_revisions.json", JSON.stringify(response, null, 2));
});

wikipedia.revisions.all("Buenaventura_Durruti", { comment: true, lang: 'es' }, function(response) {
  fs.writeFileSync(__dirname + "/output/Buenaventura_Durruti.json", JSON.stringify(response, null, 2));
});

wikipedia.categories.tree(
	"Philadelphia_Phillies",
	function(tree) {
		fs.writeFileSync(__dirname + "/output/Philadelphia_Phillies.json", JSON.stringify(tree, null, 2));
	}
);


