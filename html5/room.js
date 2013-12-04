// Room class
//  - descrip: the description of the room, that will get
//          printed for the user when they "look".
//  - exits: an array of Exit objects
//  - items (optional): an associative array, combining
//          item IDs and counts, for the room's selection
//          of stuff.
function Room(descrip, exits, items)
{
    this.descrip = descrip;
    this.exits = exits || {};
    this.items = items || {};
    this.id = null;
}

module.exports = Room;


