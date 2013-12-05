var AIBody = require("./aibody.js");
var core = require("./core.js");
var serverState = require("./serverState.js");
var format = require("util").format;

// Mule class
//  An NPC for following the player and carrying things.
// players.
//  - roomId: the name of the room in which the Mule starts.
//  - hp: how much health the Mule starts with.
//  - items (optional): an associative array of item IDs to counts,
//          representing the stuff in the character's pockets.
//  - equipment (optional): an associative array of item IDs to
//          counts, representing the stuff in use by the character.

function Mule(roomId, hp, speak, items, equipment, id) {
    AIBody.call(this, roomId, hp, items, equipment, id);
    this.speak = speak || [];
}

module.exports = Mule;

Mule.prototype = Object.create(AIBody.prototype);

Mule.prototype.copyTo = function (obj) {
    Mule.call(obj, this.roomId, this.hp, this.items, this.equipment, this.id);
}

Mule.prototype.idleAction = function () {
    var rm = serverState.getRoom(this.roomId);
}
