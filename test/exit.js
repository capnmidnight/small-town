var Exit = require("../exit.js");
var Thing = require("../thing.js");
var Room = require("../room.js");
var assert = require("assert");

describe("Exit", function(){
	var db = null;
	var room1 = null;
	var room2 = null;
	
	beforeEach(function(){
		db = {};
		room1 = new Room(db, "room1");
		room2 = new Room(db, "room2");
	});
	
	it("requires db", function(){
		assert.throws(function(){
			new Exit();
		});
	});
	
	it("requires id", function(){
		assert.throws(function(){
			new Exit(db);
		});
	});
	
	it("requires from roomId", function(){
		assert.throws(function(){
			new Exit(db, "north");
		});
	});
	
	it("requires to roomId", function(){
		assert.throws(function(){
			new Exit(db, "north", "room1");
		});
	});
	
	it("requires an existing from room", function(){
		assert.throws(function(){
			new Exit(db, "north", "nonRoomId");
		});
	});
	
	it("requires an existing to room", function(){
		assert.throws(function(){
			new Exit(db, "north", "room1", "nonRoomId");
		});
	});
	
	it("is a Thing", function(){
		var x = new Exit(db, "north", "room1", "room2");
		assert.ok(x instanceof Thing, "not a subclass of Thing");
	});
	
	it("persists fromRoomId", function(){
		var x = new Exit(db, "north", "room1", "room2");
		assert.strictEqual(x.fromRoomId, "room1");
	});
	
	it("persists toRoomId", function(){
		var x = new Exit(db, "north", "room1", "room2");
		assert.strictEqual(x.toRoomId, "room2");
	});
	
	it("generates a special ID", function(){
		var x = new Exit(db, "north", "room1", "room2");
		assert.strictEqual(x.id, "exit-north-from-room1-to-room2");
	});
	
	it("uses base ID as description", function(){
		var x = new Exit(db, "north", "room1", "room2");
		assert.strictEqual(x.description, "north");
	});
	
	it("creates reverse exit, too", function(){
		var x = new Exit(db, "north", "room1", "room2");
		var rId = "exit-south-from-room2-to-room1";
		var y = db[rId];
		assert.ok(y, "reverse exit doesn't exist");
		assert.strictEqual(y.id, rId);
	});
});
