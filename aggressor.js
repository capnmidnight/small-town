var AIBody = require("./aibody.js");
var core = require("./core.js");
var format = require("util").format;

// Aggressor class
//  A violent NPC. Will alternate between moving and attacking
// players.
//  - roomId: the name of the room in which the Aggressor starts.
//  - hp: how much health the Aggressor starts with.
//  - items (optional): an associative array of item IDs to counts,
//          representing the stuff in the character's pockets.
//  - equipment (optional): an associative array of item IDs to
//          counts, representing the stuff in use by the character.

function Aggressor(db, roomId, hp, items, equipment, id)
{
    AIBody.call(this, db, roomId, hp, items, equipment, id);
    this.moving = true;
}

Aggressor.prototype = Object.create(AIBody.prototype);
module.exports = Aggressor;

Aggressor.prototype.idleAction = function ()
{
    var rm = this.db.rooms[this.roomId];
    var people = core.hashMap(this.db.getPeopleIn(this.roomId), core.key);
    var targetId = core.selectRandom(people);
    var exits = core.hashMap(rm.exits, core.key);
    var exit = core.selectRandom(exits);
    if(!this.moving && targetId)
    {
        this.cmd("say RAAAARGH!");
        this.cmd(format("attack %s", targetId));
    }
    else if(exit)
        this.cmd(exit);
    this.moving = !this.moving;
}
