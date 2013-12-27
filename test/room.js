var Room = require("../room.js");
var Item = require("../item.js");
var Exit = require("../exit.js");
var assert = require("assert");

describe("Rooms", function(){
	var db = null;
	beforeEach(function(){
	    db = {};

	    new Item(db, "sword", "a sword");
	    new Item(db, "steel-wool", "scratchy");
	    new Item(db, "rusty-metal", "tetnus");
	});
	
	describe("when destroyed", function(){
		it("no longer exists", function(){
			var room = new Room(db, "test-room");
			room.destroy();
			assert.ok(!db.test);
		});		
	});

	describe("parsing", function () {
	    it("generates basic room", function () {
	        var room1 = new Room(db, "Main-Square", "test room");
	        var room = Room.parse(db, "room2",
"Introduction\r\n" +
"\r\n" +
"Learning the commands to the game important. You can see\r\n" +
"all of the commands you're capable of by typing 'help' in\r\n" +
"the command box below and either hitting your enter key\r\n" +
"or tapping the enter button.\r\n" +
"\r\n" +
"You will have to take the items in this room\r\n" +
"and make a sword in order to exit. type 'take steel-wool'\r\n" +
"followed by 'take rusty-metal'. Then type 'make sword'.\r\n" +
"You will the be able to leave this room by typing 'exit'.\r\n" +
"Please don't take more than you need, or other new users\r\n" +
"will not have enough to be able to exit for several minutes.");
	        assert(room, "Object wasn't created");
	        assert.equal(room.description,
"Introduction\r\n" +
"\r\n" +
"Learning the commands to the game important. You can see\r\n" +
"all of the commands you're capable of by typing 'help' in\r\n" +
"the command box below and either hitting your enter key\r\n" +
"or tapping the enter button.\r\n" +
"\r\n" +
"You will have to take the items in this room\r\n" +
"and make a sword in order to exit. type 'take steel-wool'\r\n" +
"followed by 'take rusty-metal'. Then type 'make sword'.\r\n" +
"You will the be able to leave this room by typing 'exit'.\r\n" +
"Please don't take more than you need, or other new users\r\n" +
"will not have enough to be able to exit for several minutes.");
	    });

	    it("generates room with exits", function () {
	        var room1 = new Room(db, "Main-Square", "test room");
	        var room = Room.parse(db, "room2",
"exits\r\n" +
"    exit to Main-Square locked with sword \"Don't forget to take the items (rusty metal and steel-wool) and use them to make a sword. Try \\\"take all\\\" followed by \\\"make sword\\\".\"\r\n" +
"\r\n" +
"Introduction\r\n" +
"\r\n" +
"Learning the commands to the game important. You can see\r\n" +
"all of the commands you're capable of by typing 'help' in\r\n" +
"the command box below and either hitting your enter key\r\n" +
"or tapping the enter button.");
	        assert(room, "Object wasn't created");
	        assert.equal(room.description,
"Introduction\r\n" +
"\r\n" +
"Learning the commands to the game important. You can see\r\n" +
"all of the commands you're capable of by typing 'help' in\r\n" +
"the command box below and either hitting your enter key\r\n" +
"or tapping the enter button.");
	        var exits = room.ofType(Exit);
	        assert.equal(exits.length, 1);
	        assert.equal(exits[0].id, "exit-exit-from-room2-to-Main-Square");
	    });

	    it("generates room with items", function () {
	        var room1 = new Room(db, "Main-Square", "test room");
	        var room = Room.parse(db, "room2",
"items\r\n" +
"    steel-wool 10\r\n" +
"    rusty-metal 10\r\n" +
"\r\n" +
"Introduction\r\n" +
"\r\n" +
"Learning the commands to the game important. You can see\r\n" +
"all of the commands you're capable of by typing 'help' in\r\n" +
"the command box below and either hitting your enter key\r\n" +
"or tapping the enter button.");
	        assert(room, "Object wasn't created");
	        assert.equal(room.description,
"Introduction\r\n" +
"\r\n" +
"Learning the commands to the game important. You can see\r\n" +
"all of the commands you're capable of by typing 'help' in\r\n" +
"the command box below and either hitting your enter key\r\n" +
"or tapping the enter button.");
	        var items = room.ofType(Item);
	        assert.equal(items.length, 20);
	    });

	    it("generates room with exits and items", function () {
	        var room1 = new Room(db, "Main-Square", "test room");
	        var room = Room.parse(db, "room2",
"exits\r\n" +
"    exit to Main-Square locked with sword \"Don't forget to take the items (rusty metal and steel-wool) and use them to make a sword. Try \\\"take all\\\" followed by \\\"make sword\\\".\"\r\n" +
"\r\n" +
"items\r\n" +
"    steel-wool 10\r\n" +
"    rusty-metal 10\r\n" +
"\r\n" +
"Introduction\r\n" +
"\r\n" +
"Learning the commands to the game important. You can see\r\n" +
"all of the commands you're capable of by typing 'help' in\r\n" +
"the command box below and either hitting your enter key\r\n" +
"or tapping the enter button.");
	        assert(room, "Object wasn't created");
	        assert.equal(room.description,
"Introduction\r\n" +
"\r\n" +
"Learning the commands to the game important. You can see\r\n" +
"all of the commands you're capable of by typing 'help' in\r\n" +
"the command box below and either hitting your enter key\r\n" +
"or tapping the enter button.");
	        var items = room.ofType(Item);
	        assert.equal(items.length, 20);
	        var exits = room.ofType(Exit);
	        assert.equal(exits.length, 1);
	        assert.equal(exits[0].id, "exit-exit-from-room2-to-Main-Square");
	    });
	});
});
