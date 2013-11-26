function AIBody(roomId, hp, items, equipment)
{
    Body.call(this, roomId, hp, items, equipment);
    this.dt = Math.floor(Math.random() * 5) * 200 + 5000;
    this.lastTime = Date.now();
    this.target = null;
}

AIBody.prototype = Object.create(Body.prototype);

AIBody.prototype.idleAction = function ()
{
    var rm = currentRooms[this.roomId];
    var exitIds = hashMap(rm.exits, key);
    this.move(selectRandom(exitIds));
}

AIBody.prototype.react_damage = function (m)
{
    this.yell(format("Ouch! Stop it, {0}!", m.fromId));
}

AIBody.prototype.react_tell = function (m)
{
    var msg = m.payload[0];
    if (msg == "quit")
    {
        this.quit();
    }
}

AIBody.prototype.react_say = function (m)
{
    if (m.payload[0] == "hello")
        this.say("Hi!");
}

AIBody.prototype.react = function (m)
{
    var handler = "react_" + m.message;
    if (this[handler])
        this[handler](m);
}

AIBody.prototype.update = function ()
{
    var now = Date.now();

    while (this.msgQ.length > 0)
    {
        this.react(this.msgQ.shift());
    }

    if ((now - this.lastTime) >= this.dt)
    {
        if (this.hp > 0)
            this.idleAction();
        this.lastTime = now;
    }
};
