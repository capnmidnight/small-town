var Exit = require("../exit.js");
var Thing = require("../thing.js");
var Room = require("../room.js");
var Body = require("../body.js");
var assert = require("assert");

describe("basic Exits", function(){
	var db = null;
	var room1 = null;
	var room2 = null;
	var x = null;
	var user = null;
	
	beforeEach(function(){
		db = {};
		room1 = new Room(db, "room1");
		room2 = new Room(db, "room2");
		x = new Exit(db, "north", "room1", "room2");
		user = new Body();
	});

	describe("degenerate conditions", function(){
		it("requires db", function(){
			assert.throws(function(){
				new Exit();
			});
		});
		
		it("requires id", function(){
			assert.throws(function(){
				new Exit({});
			});
		});
		
		it("requires from roomId", function(){
			assert.throws(function(){
				new Exit({}, "north");
			});
		});
		
		it("requires to roomId", function(){
			assert.throws(function(){
				new Exit({}, "north", "room1");
			});
		});
		
		it("requires an existing from room", function(){
			assert.throws(function(){
				new Exit({}, "north", "nonRoomId");
			});
		});
		
		it("requires an existing to room", function(){
			assert.throws(function(){
				new Exit({"room1":room1}, "north", "room1", "nonRoomId");
			});
		});
	});
	
	it("is a Thing", function(){
		assert.ok(x instanceof Thing, "not a subclass of Thing");
	});
	
	it("persists fromRoomId", function(){
		assert.strictEqual(x.fromRoomId, "room1");
	});
	
	it("persists toRoomId", function(){
		assert.strictEqual(x.toRoomId, "room2");
	});
	
	it("generates a special ID", function(){
		assert.strictEqual(x.id, "exit-north-from-room1-to-room2");
	});
	
	it("uses base ID as description", function(){
		assert.strictEqual(x.description, "north");
	});
	
	it("creates reverse exit, too", function(){
		var rId = "exit-south-from-room2-to-room1";
		var y = db[rId];
		assert.strictEqual(x.reverseId, rId);
		assert.ok(y, "reverse exit doesn't exist");
		assert.strictEqual(y.id, rId);
		assert.strictEqual(y.fromRoomId, "room2");
		assert.strictEqual(y.toRoomId, "room1");
	});
	
	it("makes room parent of exit", function(){
		assert.ok(x.parentId);
		assert.strictEqual(room1, x.getParent());
	});
	
	it("makes exit child of room", function(){
		var y = room1.ofType(Exit)[0];
		assert.strictEqual(y, x);
	});
	
	it("makes reverse exit child of other room", function(){
		var rx = db[x.reverseId];
		var y = room2.ofType(Exit)[0];
		assert.strictEqual(y, rx);
	});
	
	it("makes reverse exit child of other room", function(){
		var rx = db[x.reverseId];
		var y = room2.ofType(Exit)[0];
		assert.strictEqual(y, rx);
	});
	
	it("is visible by default", function(){
		
		
	});
});
