var AIBody = require("./aibody.js");
var core = require("./core.js");
var serverState = require("./serverState.js");
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

function Aggressor(roomId, hp, items, equipment, id)
{
    AIBody.call(this, roomId, hp, items, equipment, id);
    this.moving = true;
}

module.exports = Aggressor;

Aggressor.prototype = Object.create(AIBody.prototype);

Aggressor.prototype.copyTo = function(obj)
{
    Aggressor.call(obj, this.roomId, this.hp, this.items, this.equipment, this.id);
}

Aggressor.prototype.idleAction = function ()
{
    var rm = serverState.getRoom(this.roomId);
    var people = core.hashMap(serverState.getPeopleIn(this.roomId), core.key);
    var target = core.selectRandom(people);
    var exits = core.hashMap(rm.exits, core.key);
    var exit = core.selectRandom(exits);
    if(!this.moving && target)
    {
        this.cmd("say RAAAARGH!");
        this.cmd(format("attack %s", core.selectRandom(people)));
    }
    else if(exit)
        this.cmd(exit);
    this.moving = !this.moving;
}
