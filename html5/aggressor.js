function Aggressor(roomId, hp, items, equipment)
{
    AIBody.call(this, roomId, hp, items, equipment);
    this.moving = true;
}

Aggressor.prototype = Object.create(AIBody.prototype);

Aggressor.prototype.idleAction = function ()
{
    var rm = getRoom(this.roomId);
    var people = hashMap(where(getPeopleIn(this.roomId), isAI, equal, false), key);
    var exits = hashMap(rm.exits, key);
    if(!this.moving)
    {
        this.say("RAAAARGH!");
        this.attack(selectRandom(people));
    }
    else
    {
        this.move(selectRandom(exits));
    }
    this.moving = !this.moving;
}
