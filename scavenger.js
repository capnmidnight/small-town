var AIBody = require("./aibody.js");
var core = require("./core.js");
var serverState = require("./serverState.js");
var format = require("util").format;

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
    var rm = serverState.getRoom(this.roomId);
    var items = core.hashMap(rm.items, core.key);
    var item = core.selectRandom(items);
    var exits = core.hashMap(rm.exits, core.key);
    var exit = core.selectRandom(exits);
    if(!this.moving && item)
        this.cmd(format("take %s", item));
    else if(exit)
        this.cmd(exit);
    this.moving = !this.moving;
}
