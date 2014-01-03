var AIBody = require("./aibody.js");
var Message = require("../message.js");
var core = require("../core.js");
var format = require("util").format;
var fs = require("fs");

// TutorialBot class
//  A bot that can do things in reaction to user actions
function TutorialBot(db, roomId, id) {
    var lines = fs
        .readFileSync("./bots/" + id + ".script", { encoding: "utf8" })
        .split("\n");

    var initialItems = JSON.parse(lines.shift().trim());

    AIBody.call(this, db, roomId, Number.MAX_VALUE, initialItems, null, id);

    this.tutorial = lines
        .map(function (exec) {
            exec = exec.trim();
            if (exec[0] === '>')
                exec = exec.substring(1);
            else
                exec = "tell USERID " + exec;
            return exec;
        })

    this.users = {};
    this.dt = 1000;
}

TutorialBot.prototype = Object.create(AIBody.prototype);
module.exports = TutorialBot;

TutorialBot.prototype.doForEveryone = function (thunk){
    for (var userId in this.users) {
        var stepNo = this.users[userId];
        if (stepNo < this.tutorial.length) {
            var step = this.tutorial[stepNo].replace(/USERID/g, userId);
            var nextStepNo = thunk.call(this, userId, stepNo, step);
            if (nextStepNo > stepNo) {
                this.users[userId] = nextStepNo;
            }
        }
    }
}

TutorialBot.prototype.idleAction = function () {
    this.doForEveryone(function (userId, i, step) {
        if (step.substring(0, 4) !== "wait") {
            this.cmd(step);
            return i + 1;
        }
        return i;
    });
};

TutorialBot.prototype.react = function (msg) {
    if (this.db.users[msg.fromId] && msg.fromId != this.id) {
        core.log("TutorialBot: ", this.id, msg);
        if (this.users[msg.fromId] === undefined)
            this.users[msg.fromId] = 0;

        var cmd = "wait " + msg.fromId + " " + msg.message + " " + msg.payload.join(" ");
        this.doForEveryone(function (userId, i, step) {
            if (step === cmd) {
                return i + 1;
            }
            return i;
        });
    }
};

TutorialBot.prototype.cmd_done = function (userId) {
    if (this.users[userId])
        delete this.users[userId];
};