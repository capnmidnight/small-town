var Exit = require("../exit.js");
var Thing = require("../thing.js");
var assert = require("assert");

describe("Exit", function(){
	var db = null;
	
	beforeEach(function(){
		db = {};
	});
	
	it("is a Thing", function(){
		var x = new Exit(db);
		assert.ok(x instanceof Thing, "not a subclass of Thing");
	});
	
	
});
