// Aggressor class
//  A violent NPC. Will alternate between moving and attacking
// players.
//  - roomId: the name of the room in which the Aggressor starts.
//  - hp: how much health the Aggressor starts with.
//  - items (optional): an associative array of item IDs to counts,
//          representing the stuff in the character's pockets.
//  - equipment (optional): an associative array of item IDs to
//          counts, representing the stuff in use by the character.

function Aggressor(roomId, hp, items, equipment)
{
    AIBody.call(this, roomId, hp, items, equipment);
    this.moving = true;
}

Aggressor.prototype = Object.create(AIBody.prototype);

Aggressor.prototype.idleAction = function ()
{
    var rm = getRoom(this.roomId);
    var people = hashMap(getRealPeopleIn(this.roomId), key);
    var target = selectRandom(people);
    var exits = hashMap(rm.exits, key);
    var exit = selectRandom(exits);
    if(!this.moving && target)
    {
        this.cmd("say RAAAARGH!");
        this.cmd(format("attack {0}", selectRandom(people)));
    }
    else if(exit)
        this.cmd(exit);
    this.moving = !this.moving;
}
