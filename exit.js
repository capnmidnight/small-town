// Exit class:
//  A doorway from one room to the other, with an optional lock.
//  Exits are uni-directional. An exit from Room A to Room B does
//  not automatically create a path from Room B to Room A.
//  - roomId: the room to which this Exit links
//  - key (optional): an itemId that must be the user's inventory
//          for them to be allowed through the door.
//  - lockMsg (optional): the message to display to the user if
//          they try to go through the exit but don't have the
//          key item. Use this to create puzzle hints.
//  - cloak (optional): an itemId that must be in the user's
//          inventory for them to be allowed to *see* the door.
function Exit(roomId, key, lockMsg, cloak)
{
    this.roomId = roomId;
    this.key = key;
    this.lockMsg = lockMsg || "The way is locked";
    this.cloak = cloak;
    this.id = null;
}

module.exports = Exit;
