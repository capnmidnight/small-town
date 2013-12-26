var Thing = require("./thing.js");
var Room = require("./room.js");
var assert = require("assert");
var format = require("util").format;
/* 
 * Exit class:
 *  A doorway from one room to the other, with an optional lock.
 *  Exits are uni-directional. An exit from Room A to Room B does
 *  not automatically create a path from Room B to Room A.
 *
 *  - db: a database of all Things.
 *  - direction: the name to use for this Exit.
 *  - fromRoomId: the room from which this Exit starts
 *  - toRoomId: the room to which this Exit links
 *  - options (optional): a hash of the following options 
 *      - cloak (optional): an itemId that must be in the user's
 *          inventory for them to be allowed to *see* the door.
 *      - lock (optional): an itemId that must be the user's inventory
 *          for them to be allowed through the door.
 *      - lockMessage (optional): the message to display to the user if
 *          they try to go through the exit but don't have the
 *          key item. Use this to create puzzle hints.
 *      - oneWay (optional): if truish, don't create the reverse link.
 * 		- timeCloak (optional): a structure that defines a time period
 * 			on which the exit is visible or invisible:
 * 			- period: the total time the visibility cycle takes.
 * 			- shift (optional): an offset of time to push the start
 * 				of the phase away. Defaults to 0.
 * 			- width (optional): the proportion of time of the cycle that
 * 				the phase is "on". Defaults to 0.5.
 * 		- timeLocked (optional): a structure that defines a time period
 * 			on which the exit is locked or unlocked:
 * 			- period: the total time the lock cycle takes.
 * 			- shift (optional): an offset of time to push the start
 * 				of the phase away. Defaults to 0.
 * 			- width (optional): the proportion of time of the cycle that
 * 				the phase is "on". Defaults to 0.5.
 *      - timeLockMessage (optional): the message to display to the user
 * 			if they try to go through the exit but it isn't open at this
 * 			time.
 */
function Exit(db, direction, fromRoomId, toRoomId, options)
{
    var id = direction && format(
		"exit-%s-from-%s-to-%s", 
		direction, 
		fromRoomId, 
		toRoomId);
		
    Thing.call(this, db, id, direction);
    this.fromRoomId = checkRoomId(db, fromRoomId, "from");
    this.toRoomId = checkRoomId(db, toRoomId, "to");
    
    options = options || {};
    
    this.cloak = checkLockSet(db, options.cloak);
	this.lock = checkLockSet(db, options.lock);
    this.lockMessage = options.lockMessage || "You need a key to get through this exit.";
    
    this.timeCloak = checkTimerSet(options.timeCloak);
    this.timeLock = checkTimerSet(options.timeLock);
    this.timeLockMessage = options.timeLockMessage || "The exit is locked at this time";
    
    this.setParent(fromRoomId);
    
    if(!options.oneWay)
    {
		options.oneWay = true;
        var reverse = new Exit(db, reverseDirection[direction], toRoomId, fromRoomId, options);
        this.reverseId = reverse.id;
    }
}

Exit.prototype = Object.create(Thing.prototype);
module.exports = Exit;

function checkLockSet(db, lock)
{
	if(!(lock instanceof Array))
		lock = lock ? [lock] : [];
	return lock.map(function(itemId){
		if(itemId.id)
			itemId = itemId.id;
		assert.ok(db[itemId], itemId + " is not an item.");
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

function checkLockOpen (db, lock, user)
{
	if(user instanceof String)
		user = db[user];
	return lock.reduce(function(prev, itemId){
			return prev && (!!user.items[itemId] || !!user.equipment[itemId]);
	}, true);
}

Exit.prototype.isVisibleTo = function (user)
{
	return checkLockOpen(this.db, this.cloak, user);
};

Exit.prototype.isOpenTo = function (user)
{
	return this.isVisibleTo(user)
		&& checkLockOpen(this.db, this.lock, user);
};

function checkTimerSet(timer){
	timer = timer || {};
	timer.period = timer.period || 1;
	timer.shift = timer.shift || 0;
	timer.width = timer.width || 0.5;
	if(timer.period == 1)
	{
		timer.mid = 1;
		timer.shift = 0;
	}
	else
	{
		timer.mid = Math.floor(timer.period * timer.width);
	}
	delete timer.width;
	return timer;
}

function checkTimerOn(timer, t)
{
	t -= timer.shift;
	
	// javascript's modulus operator doesn't work well for
	// negative values.
	while(t < 0) t += timer.period;
	
	return (t % timer.period) < timer.mid;
}

Exit.prototype.isVisibleAt = function(t)
{
	return checkTimerOn(this.timeCloak, t);
};

Exit.prototype.isOpenAt = function(t)
{
	return this.isVisibleAt(t)
		&& checkTimerOn(this.timeLock, t);
};

Exit.prototype.isVisible = function(user, t)
{
	return this.isVisibleTo(user)
		&& this.isVisibleAt(t);
};

Exit.prototype.isOpen = function(user, t)
{
	return this.isOpenTo(user)
		&& this.isOpenAt(t);
};

Exit.prototype.describe = function (user, t)
{
	return this.isVisible(user, t)
		&& format("%s to %s%s",
			this.description,
			this.toRoomId,
			this.isOpen(user, t) ? "" : " (LOCKED)")
		|| "";
};
