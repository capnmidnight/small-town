var AIBody = require("./aibody.js");
var core = require("./core.js");
var serverState = require("./serverState.js");

function Scavenger(roomId, hp, items, equipment, id)
{
    AIBody.call(this, roomId, hp, items, equipment, id);
    this.moving = false;
}

module.exports = Scavenger;

Scavenger.prototype = Object.create(AIBody.prototype);

Scavenger.prototype.copyTo = function(obj)
{
    Scavenger.call(obj, this.roomId, this.hp, this.items, this.equipment, this.id);
}

Scavenger.prototype.idleAction = function ()
{
    console.log("scavenging");
    var rm = serverState.rooms[this.roomId];
    var items = core.hashMap(serverState.items[this.roomId], core.key);
    var item = core.selectRandom(item);
    var exits = core.hashMap(rm.exits, core.key);
    var exit = core.selectRandom(exits);
    if(!this.moving && item)
        this.cmd(core.format("take {0}", item));
    else if(exit)
        this.cmd(exit);
    this.moving = !this.moving;
}
