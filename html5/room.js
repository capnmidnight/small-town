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
    this.exits = exits;
    this.items = items ? items : {};
    this.id = null;
}

// Exit class:
//  A doorway from one room to the other, with an optional lock.
//  Exits are uni-directional. An exit from Room A to Room B does
//  not automatically create a path from Room B to Room A.
//  - roomId: the room to which this Exit links
//  - key (optional): an item ID that must be in the user's
//          inventory for them to be allowed through the door.
//  - lockMsg (optional): the message to display to the user if
//          they try to go through the exit but don't have the
//          key item. Use this to create puzzle hints.
function Exit(roomId, key, lockMsg)
{
    this.roomId = roomId;
    this.key = key;
    this.lockMsg = lockMsg;
    this.id = null;
}

var currentRooms = {};
currentRooms.welcome = new Room(
  "Welcome!\n\n\n\nWelcome to a very simple, Multi-User\n\n"
+ "Dungeon that I have created. This MUD\n\n"
+ "is almost completely useless at this time.\n\n"
+ "However, you can run around in the few\n\n"
+ "rooms that exist and try to get a feel\n\n"
+ "for things!\n\n",
          {"leave": new Exit("intro")});

currentRooms.intro = new Room(
  "Introduction\n\n\n\nLearning the commands to the game important.\n\n"
+ "You can see all of the commands you're\n\n"
+ "capable of by typing <strong>help</strong> in the command\n\n"
+ "box below and either hitting your enter key\n\n"
+ "or tapping the enter button.\n\n"
+ "\n\n"
+ "You will have to take the items in this room\n\n"
+ "and make a key in order to exit.\n\n",
           { "exit": new Exit("mainSquare", "sword",
  "Don't forget to take the items (rusty metal"
+ "and steel-wool) and use them to make a sword.\n\n"
+ "Try \"take all\" followed by \"make sword\".\n\n") },
           { "steel-wool": 3, "rusty-metal": 1 });

currentRooms.mainSquare = new Room(
  "Main Square\n\n\n\n"
+ "Welcome! You made it! There is nowhere else to go. You are stuck here.");

setIds(currentRooms);
