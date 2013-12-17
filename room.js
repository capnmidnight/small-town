var fs = require("fs");

// Room class
//  - descrip: the description of the room, that will get
//          printed for the user when they "look".
//  - exits: an array of Exit objects
//  - items (optional): an associative array, combining
//          item IDs and counts, for the room's selection
//          of stuff.
function Room(descrip, exits, items)
{
    this.descrip = descrip || "no information";
    this.exits = exits || {};
    this.items = items || {};
    this.id = null;
}

module.exports = Room;

// loads a room from a text file in the rough room format:
//  https://github.com/capnmidnight/philly_mud/issues/5
Room.load = function(filename){

};