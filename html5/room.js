// Room class
//	- descrip: the description of the room, that will get
//			printed for the user when they "look".
//	- exits: an array of Exit objects
//	- items (optional): an associative array, combining
//			item IDs and counts, for the room's selection
//			of stuff.
function Room(descrip, exits, items)
{
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
function Exit(roomId, key, lockMsg)
{
    this.roomId = roomId;
    this.key = key;
    this.lockMsg = lockMsg;
    this.id = null;
}

var currentRooms = {

    "test": new Room("a test room\n\nThere is not a lot to see here.\nThis is just a test room.\nIt's meant for testing.\nNothing more.\nGoodbye.",
          {
              "north": new Exit("test2"),
              "east": new Exit("test3"),
              "south": new Exit("test4", "feather", "you need a feather")
          },
          { "sword": 1, "bird": 1, "rock": 5, "gold": 10 }),

    "test2": new Room("another test room\n\nKeep moving along",
           { "south": new Exit("test") },
           { "steel-wool": 4 }),

    "test3": new Room("a loop room\n\nit's probably going to work",
           { "south": new Exit("test5") }),

    "test4": new Room("locked room\n\nThis room was locked with the bird",
           { "north": new Exit("test") }),

    "test5": new Room("a loop room, 2\n\nit's probably going to work",
           { "west": new Exit("test4") })
};

setIds(currentRooms);
