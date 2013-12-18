var Body = require("./body.js");
var core = require("./core.js");
var format = require("util").format;

//  AIBody class
//  All AI systems either run through
//  run through Reactions or Idle Actions. Reactions occur
//  immediately after a message is received. Idle Actions
//  occur on a set time frequency.
//      - parameters are the same as the Body class. AIBody is
//                          a subclass of Body
function AIBody(roomId, hp, items, equipment, id) {
    Body.call(this, roomId, hp, items, equipment, id);
    this.dt = Math.floor(Math.random() * 5) * 200 + 5000;
    this.lastTime = Date.now();
    this.targetId = null;
}

module.exports = AIBody;

AIBody.prototype = Object.create(Body.prototype);

AIBody.prototype.copyTo = function (obj) {
    AIBody.call(obj, this.roomId, this.hp, this.items, this.equipment, this.id);
}

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
AIBody.prototype.update = function () {
    var now = Date.now();

    while (this.msgQ.length > 0)
        this.react(this.msgQ.shift());

    if ((now - this.lastTime) >= this.dt) {
        if (this.hp > 0)
            this.idleAction();
        this.lastTime = now;
    }
};

// simplifies adding commands to the command queue.
// - parameters are the same as for format(template, [args...])
AIBody.prototype.cmd = function (msg) {
    this.inputQ.push(msg);
}

AIBody.prototype.idleAction = function () {
    var rm = this.db.getRoom(this.roomId);
    var exits = core.hashMap(rm.exits, core.key);
    var exit = core.selectRandom(exit);
    if (exit)
        this.cmd(exit);
}

// checks to see if there is a reaction registered
// for the message type, then fires the reaction
AIBody.prototype.react = function (m) {
    var handler = "react_" + m.message;
    if (this[handler])
        this[handler](m);
}

AIBody.prototype.react_damage = function (m) {
    this.cmd(format("yell Ouch! Stop it, %s!", m.fromId));
}

AIBody.prototype.react_attack = function (m) {
    this.cmd(format("say Whoa, settle down, %s!", m.fromId));
}

// A friendly greeting!
AIBody.prototype.react_say = function (m) {
    if (m.payload[0] == "hello")
        this.cmd("say Hi!");
}

AIBody.prototype.react_yell = function (m) {
    if (!(this.db.users[m.fromId] instanceof AIBody))
        this.cmd("yell SHADDAP!");
}
