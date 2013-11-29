var AIBody = require("./aibody.js");
var core = require("./core.js");
var serverState = require("./serverState.js");

function Scavenger(roomId, hp, items, equipment)
{
    AIBody.call(this, roomId, hp, items, equipment);
    this.moving = false;
}

module.exports = Scavenger;

Scavenger.prototype = Object.create(AIBody.prototype);

Scavenger.prototype.idleAction = function ()
{
    var rm = serverState.everywhere[this.roomId];
    var items = core.hashMap(rm.items, core.key);
    var item = core.selectRandom(item);
    var exits = core.hashMap(rm.exits, core.key);
    var exit = core.selectRandom(exits);
    if(!this.moving && item)
        this.cmd(core.format("take {0}", item));
    else if(exit)
        this.cmd(exit);
    this.moving = !this.moving;
}
