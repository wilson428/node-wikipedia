var d3 = require("d3"),

// accepts date in Wiki or JS format, delta is # of days
module.exports = function(date, delta) {
	delta = delta || 0;
	var dateFormat = d3.time.format("%Y-%m-%dT%H:%M:%SZ");
	if (typeof date === "string") {
		var date = dateFormat.parse(date);
	}
	var next = new Date(date.getTime() + 1000 * 3600 * 24 * delta);
	return dateFormat(next);
}