var Room = require("../room.js");
var assert = require("assert");

describe("Rooms", function(){
	var serverState = {};
	beforeEach(function(){
		serverState.rooms = {};
	});
	
	describe("when destroyed", function(){
		it("no longer exists", function(){
			var room = new Room(serverState.rooms, "test-room");
			room.destroy();
			assert.ok(!serverState.rooms.test);
		});		
	});	
});
