var Thing = require("./thing.js");
var fs = require("fs");

// Room class
//  - db: a database of all things
//  - description: the description of the room, that will get
//          printed for the user when they "look".
//  - exits: an array of Exit objects
//  - items (optional): an associative array, combining
//          item IDs and counts, for the room's selection
//          of stuff.
//  - npcs (optional): an associative array, combining
//			characters IDs and Body subclasses, for the 
//			characters that start in this room (if defining,
//			them in the room is most natural).
function Room(db, description, exits, items, npcs)
{
    Thing.call(this, db, description);
    this.exits = exits || {};
    this.items = items || {};
    this.npcs = npcs || {};
}
module.exports = Room;

Room.prototype = Object.create(Thing.prototype);


// loads a room from a text file in the rough room format:
//  https://github.com/capnmidnight/philly_mud/issues/5
Room.load = function(filename){

};

Room.parse = function(text){
	
};
