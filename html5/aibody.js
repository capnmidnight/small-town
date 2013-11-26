//  AIBody class
//  All AI systems either run through
//  run through Reactions or Idle Actions. Reactions occur
//  immediately after a message is received. Idle Actions
//  occur on a set time frequency.
//      - parameters are the same as the Body class. AIBody is
//                          a subclass of Body
function AIBody(roomId, hp, items, equipment)
{
    Body.call(this, roomId, hp, items, equipment);
    this.dt = Math.floor(Math.random() * 5) * 200 + 5000;
    this.lastTime = Date.now();
    this.target = null;
}

AIBody.prototype = Object.create(Body.prototype);

// occurs as quickly as possible. Allows the AI unit
// to react to actions against it immediately, and
// take actions when it is time to.
//
// The update function only generates commands and
// adds them to the character's input queue. There
// after, the rest of the game logic for characters
// takes over, making AI characters only able to
// interact with the world in the same way that users
// do. However, AI characters can see everything
// in the game.
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

// simplifies adding commands to the command queue.
// - parameters are the same as for format(template, [args...])
AIBody.prototype.cmd = function(msg)
{
    this.inputQ.push(msg);
}

AIBody.prototype.idleAction = function ()
{
    var rm = currentRooms[this.roomId];
    var exits = hashMap(rm.exits, key);
    var exit = selectRandom(exit);
    if(exit)
        this.cmd(exit);
}

// checks to see if there is a reaction registered
// for the message type, then fires the reaction
AIBody.prototype.react = function (m)
{
    var handler = "react_" + m.message;
    if (this[handler])
        this[handler](m);
}

AIBody.prototype.react_damage = function (m)
{
    this.cmd(format("yell Ouch! Stop it, {0}!", m.fromId));
}

// A debugging system for AI units. They will
// issue whatever command you tell them to.
AIBody.prototype.react_tell = function (m)
{
    this.cmd(m.payload[0]);
}

// A friendly greeting!
AIBody.prototype.react_say = function (m)
{
    if (m.payload[0] == "hello")
        this.say("Hi!");
}
