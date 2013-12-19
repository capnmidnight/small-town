var Room = require("../room.js");
var assert = require("assert");

describe("Rooms", function(){
	var state = {};
	beforeEach(function(){
		state.rooms = {};
	});
	
	describe("when destroyed", function(){
		it("no longer exists", function(){
			var serverState = state;
			var room = new Room(serverState.rooms);
			room.setId("test");
			room.destroy();
			assert.ok(!serverState.rooms.test);
		});
		
	});
	
});
