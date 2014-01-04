var AIBody = require("./aibody.js");
var Message = require("../message.js");
var Aggressor = require("./aggressor.js");
var core = require("../core.js");
var format = require("util").format;
var fs = require("fs");

// ScriptedBot class
//  A bot that can do things in reaction to user actions
function ScriptedBot(db, roomId, id) {
    this.tutorial = fs
        .readFileSync("./bots/" + id + ".script", { encoding: "utf8" })
        .split("\n")
        .map(function(l){return l.trim();})
        .filter(function(l){return l.length > 0;});

    var initialItems = JSON.parse(this.tutorial.shift());

    AIBody.call(this, db, roomId, Number.MAX_VALUE, initialItems, {"tool": "katana", "torso": "imperial-breastplate"}, id);

    this.users = {};
    this.monster = null;
    this.dt = 2000;
}

ScriptedBot.prototype = Object.create(AIBody.prototype);
module.exports = ScriptedBot;

ScriptedBot.prototype.doForEveryone = function (thunk){
    for (var userId in this.users) {
        var stepNo = this.users[userId];
        if (stepNo < this.tutorial.length) {
            var step = this.tutorial[stepNo]
                .replace(/USERID/g, userId)
                .toLowerCase();
            var delta = thunk.call(this, userId, step);
            if (delta > 0)
                this.users[userId] += delta;
        }
    }
}

ScriptedBot.prototype.idleAction = function () {
    this.doForEveryone(function (userId, step) {
        if (step.substring(0, 4) !== "wait") {
            if(step != "skip")
                this.cmd(step);
            return 1;
        }
        return 0;
    });
};

ScriptedBot.prototype.react = function (msg) {
    if (this.db.users[msg.fromId] && msg.fromId != this.id) {
        if (this.users[msg.fromId] === undefined)
            this.users[msg.fromId] = 0;

        var cmd = "wait " + msg.fromId + " " + msg.message + " " + msg.payload.join(" ");
        cmd = cmd.trim().toLowerCase();
        this.doForEveryone(function (userId, step) {
            return (step === cmd ? 1 : 0);
        });
    }
};

ScriptedBot.prototype.cmd_done = function (userId) {
    if (this.users[userId])
        delete this.users[userId];
};

ScriptedBot.prototype.cmd_spawn = function(monsterName) {
    var name = this.id + "'s-" + monsterName;
    if(!this.db.users[name])
        this.monster = new Aggressor(
            this.db,
            this.roomId,
            10,
            {"gold": 10},
            null,
            name);
};

ScriptedBot.prototype.cmd_cleanup = function(userId){
    if(this.monster) {
        if(!this.monster.items.gold) {
            this.cmd("say good shot!");
            delete this.db.users[this.monster.id];
            this.monster = null;
        }
        else
            this.users[userId]--;
    }
};
