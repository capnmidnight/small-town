var Room = require("../room.js");
var Item = require("../item.js");
var Exit = require("../exit.js");
var assert = require("assert");
var fs = require("fs");

describe("Rooms", function(){
	var db = null;
	beforeEach(function(){
	    db = {};

	    new Item(db, "sword", "a sword");
	    new Item(db, "steel-wool", "scratchy");
	    new Item(db, "rusty-metal", "tetnus");
	});

	it("when destroyed no longer exists", function () {
		var room = new Room(db, "test-room");
		room.destroy();
		assert.ok(!db.test);
	});

	it("can load every file in the rooms directory", function () {
	    assert.doesNotThrow(function () {
	        var rooms = Room.loadAll(db, fs.readdirSync("rooms/")
	            .filter(function (f) { return f.match(/\.room$/); })
                .map(function (f) { return f.replace(".room", ""); }));
	    });
	});
});
