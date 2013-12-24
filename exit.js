var Thing = require("./thing.js");
var Room = require("./room.js");
var assert = require("assert");
var format = require("util").format;
// Exit class:
//  A doorway from one room to the other, with an optional lock.
//  Exits are uni-directional. An exit from Room A to Room B does
//  not automatically create a path from Room B to Room A.
//
//  - db: a database of all Things.
//  - description: the name to use for this Exit.
//  - fromRoomId: the room from which this Exit starts
//  - toRoomId: the room to which this Exit links
//  - cloak (optional): an itemId that must be in the user's
//          inventory for them to be allowed to *see* the door.
//  - key (optional): an itemId that must be the user's inventory
//          for them to be allowed through the door.
//  - lockMsg (optional): the message to display to the user if
//          they try to go through the exit but don't have the
//          key item. Use this to create puzzle hints.
//  - skipReverse (optional): if truish, don't create the reverse link.
function Exit(db, description, fromRoomId, toRoomId, cloak, key, lockMsg, skipReverse)
{
	check(db, fromRoomId, "from");
	check(db, toRoomId, "to");
	var id = format(
		"exit-%s-from-%s-to-%s", 
		description, 
		fromRoomId, 
		toRoomId);
	Thing.call(this, db, id, description);
    this.fromRoomId = fromRoomId;
    this.toRoomId = toRoomId;
    this.key = key;
    this.lockMsg = lockMsg || "The way is locked";
    this.cloak = cloak;
    this.setParent(fromRoomId);
    if(!skipReverse)
    {
		var reverse = new Exit(db, reverseDirection[description], toRoomId, fromRoomId, cloak, key, lockMsg, true);
		this.reverseId = reverse.id;
	}
}

var reverseDirection = {
	"north": "south",
	"east": "west",
	"south": "north",
	"up": "down",
	"down": "up",
	"west": "east",
	"exit": "enter",
	"enter": "exit"
};

function check(db, roomId, name)
{
	assert.ok(roomId, name + "RoomId required");
	assert.ok(db[roomId], 
		"room \"" + roomId + "\" must exist before exit can be created.");
	assert.ok(db[roomId] instanceof Room, 
		"\"" + roomId + "\" must be a room.");
}

Exit.prototype = Object.create(Thing.prototype);

module.exports = Exit;
