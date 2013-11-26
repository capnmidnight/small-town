function Scavenger(roomId, hp, items, equipment)
{
    AIBody.call(this, roomId, hp, items, equipment);
    this.moving = false;
}

Scavenger.prototype = Object.create(AIBody.prototype);

Scavenger.prototype.idleAction = function ()
{
    var rm = getRoom(this.roomId);
    var items = hashMap(rm.items, key);
    var item = selectRandom(item);
    var exits = hashMap(rm.exits, key);
    var exit = selectRandom(exits);
    if(!this.moving && item)
        this.cmd(format("take {0}", item));
    else if(exit)
        this.cmd(exit);
    this.moving = !this.moving;
}
