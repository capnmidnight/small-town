// gives every object in an associative array access to its
// own key name.
function setIds(hsh) { for (var k in hsh) hsh[k].id = k; }

// Item class
//	- descrip: a description of the item, for printing in
// 			the room or inventory.
//	- equipType: how the item may be used. See equipTypes 
//			list below.
//  - strength: for whatever equipType is chosen, this is
//			how well the item can do it.
function Item (descrip, equipType, strength) {
    this.descrip = descrip;
    this.equipType = equipType;
    this.strength = strength;
    this.id = null;
}

var equipTypes = ["none", "head", "eyes", "shoulders", "torso", 
"pants", "belt", "shirt", "biceps", "forearms", "hands", "thighs", 
"calves", "feet", "tool", "throwable", "necklace", "bracelet"];

// Recipe class
//	A set of criteria to be able to create items in the
//	users inventory. Each parameter is an associative array
//	combining an item ID with a count.
//	- ingredients: the name and count of items that must be
//			consumed out of the users inventory to be able
//			to create the item.
//	- results: the name and count of items that will be added
//			to the users inventory after the recipe has ran.
//	- tools (optional): the name and count of items that must exist in
//			the users inventory (but will not get consumed).
function Recipe (ingredients, results, tools) {
    this.ingredients = ingredients;
    this.results = results;
    this.tools = tools;
    this.id = null;
}

// Room class
//	- descrip: the description of the room, that will get
//			printed for the user when they "look".
//	- exits: an array of Exit objects
//	- items (optional): an associative array, combining
//			item IDs and counts, for the room's selection
//			of stuff.
function Room (descrip, exits, items) {
    this.descrip = descrip;
    this.exits = exits;
    this.items = items ? items : {};
    this.id = null;
}

// Exit class:
//	A doorway from one room to the other, with an optional lock.
//	Exits are uni-directional. An exit from Room A to Room B does
//  not automatically create a path from Room B to Room A.
//	- roomId: the room to which this Exit links
//	- key (optional): an item ID that must be in the user's
//			inventory for them to be allowed through the door.
//	- lockMsg (optional): the message to display to the user if
//			they try to go through the exit but don't have the 
//			key item. Use this to create puzzle hints.
function Exit (roomId, key, lockMsg) {
    this.roomId = roomId;
    this.key = key;
    this.lockMsg = lockMsg;
    this.id = null;
}

// Body class
//	A person, notionally. Both PCs and NPCs are represented as
//	Bodys right now, but NPCs get their inputQ filled by a different
//	source from PCs.
//	- roomId: the name of the room in which the Body starts.
//	- hp: how much health the Body starts with.
//	- items (optional): an associative array of item IDs to counts,
//			representing the stuff in the character's pockets.
//	- equipment (optional): an associative array of item IDs to
//			counts, representing the stuff in use by the character.	
function Body (roomId, hp, items, equipment) {
    this.roomId = roomId;
    this.hp = hp;
    this.items = items ? items : {};
    this.equipment = equipment ? equipment : {};
    this.msgQ = [];
    this.inputQ = [];
    this.id = null;
}

// Message class
//  All messages to the player are communicated through Messages. 
//  The Message is structured such that the AI system can figure
//  out what was done it it, while also being able to inform the
//  user in a meaningful way what happened.
//  - fromId: the person who caused the message to occur.
//  - msg: the actual message, what happened.
//  - payload (optional): an array that provides detailed information
//          about the message.
function Message(fromId, msg, payload) {
    this.fromId = fromId;
    this.message = msg;
    this.payload = payload || [];
}
