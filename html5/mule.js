var AIBody = require("./aibody.js");
var core = require("./core.js");
var serverState = require("./serverState.js");
var format = require("util").format;

// Mule class
//  An NPC for following the player and carrying things.
// players.
//  - roomId: the name of the room in which the Mule starts.
//  - hp: how much health the Mule starts with.
//  - items (optional): an associative array of item IDs to counts,
//          representing the stuff in the character's pockets.
//  - equipment (optional): an associative array of item IDs to
//          counts, representing the stuff in use by the character.

function Mule(roomId, hp, speak, items, equipment, targetId, id) {
    AIBody.call(this, roomId, hp, items, equipment, id);
    this.speak = speak;
    this.targetId = targetId;
}

module.exports = Mule;

Mule.prototype = Object.create(AIBody.prototype);

Mule.prototype.copyTo = function (obj) {
    Mule.call(obj, this.roomId, this.hp, this.speak, this.items, this.equipment, this.targetId, this.id);
}

Mule.prototype.idleAction = function () {
    if(Math.random() * 100 <= 10)
        this.cmd(format("say %s.", this.speak));
}

Mule.prototype.saySomething = function(targetId){
    if(this.speak)
        this.cmd(format("tell %s %s", targetId, this.speak));
}

Mule.prototype.react_tell = function (m){
    if(m.payload.length > 0){
        var msg = m.payload[0];
        if(!this.targetId)
        {
            if(msg == "follow")
            {
                this.targetId = m.fromId;
                this.saySomething(m.fromId);
            }
        }
        else
        {
            if(msg == "heel")
            {
                delete this.targetId;
                this.saySomething(m.fromId);
            }
            else if(msg.indexOf("drop") == 0)
            {
                this.cmd(msg);
                this.saySomething(m.fromId);
            }
            else if(msg == "inv")
            {
                var output = "";
                for(var itemId in this.items)
                    output += format("\t%s (%d)\n\n", itemId, this.items[itemId]);
                if (output.length == 0)
                    output = " nothing";
                else
                    output = "\n\n" + output;
                this.cmd(format("tell %s %s:%s", m.fromId, this.say, output));
            }
        }
    }
    else
        AIBody.prototype.react_tell.call(this, m);
}

Mule.prototype.react_left = function (m)
{
    if(this.targetId == m.fromId)
        this.cmd(m.payload[0]);
}

Mule.prototype.react_retrieve = function (m)
{
    if(m.fromId != this.targetId)
        this.saySomething(m.fromId);
    else
    {
        var people = serverState.getPeopleIn(this.roomId);
        var target = people[m.fromId];
        if (target)
        {
            var itemId = m.payload[0];
            var item = this.items[itemId];
            if (!item)
                this.cmd(format("tell %s I don't have that item", m.fromId));
            else
                this.cmd(format("give %s %s", m.fromId, itemId));
        }
    }
}
