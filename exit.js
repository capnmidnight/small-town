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
//  - direction: the name to use for this Exit.
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
function Exit(db, direction, fromRoomId, toRoomId, cloak, key, lockMsg, skipReverse)
{
    var id = direction && format(
		"exit-%s-from-%s-to-%s", 
		direction, 
		fromRoomId, 
		toRoomId);
		
    Thing.call(this, db, id, direction);
    this.fromRoomId = checkRoomId(db, fromRoomId, "from");
    this.toRoomId = checkRoomId(db, toRoomId, "to");
    this.cloak = checkLockSet(db, cloak);
	this.key = checkLockSet(db, key);
    this.lockMsg = lockMsg || "The way is locked";
    this.setParent(fromRoomId);
    
    if(!skipReverse)
    {
        var reverse = new Exit(db, reverseDirection[direction], toRoomId, fromRoomId, cloak, key, lockMsg, true);
        this.reverseId = reverse.id;
    }
}

function checkLockSet(db, key)
{
	if(!(key instanceof Array))
		key = key ? [key] : [];
    return key.map(function(itemId){
		if(itemId.id)
			itemId = itemId.id;
		assert.ok(db[itemId]);
		return itemId;
	});
}	

var reverseDirection = 
{
    "north": "south",
    "east": "west",
    "south": "north",
    "up": "down",
    "down": "up",
    "west": "east",
    "exit": "enter",
    "enter": "exit"
};

function checkRoomId(db, roomId, name)
{
	if(roomId.id)
		roomId = roomId.id;
		
    assert.ok(roomId, name + "RoomId required");
    assert.ok(db[roomId], 
        "room \"" + roomId + "\" must exist before exit can be created.");
    assert.ok(db[roomId] instanceof Room, 
        "\"" + roomId + "\" must be a room.");
        
    return roomId;
}

Exit.prototype = Object.create(Thing.prototype);
module.exports = Exit;

function checkKeyUnlocked (db, key, user)
{
	if(user instanceof String)
		user = db[user];
	return key.reduce(function(prev, itemId){
			return prev && (!!user.items[itemId] || !!user.equipment[itemId]);
	}, true);
}

Exit.prototype.visibleTo = function (user)
{
	return checkKeyUnlocked(this.db, this.cloak, user);
};

Exit.prototype.openTo = function (user)
{
	return checkKeyUnlocked(this.db, this.key, user);
};
