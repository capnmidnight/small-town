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

module.exports = Exit;
