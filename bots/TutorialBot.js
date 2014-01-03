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

TutorialBot.prototype.idleAction = function () {
    for (var userId in this.users) {
        this.playTutorialFor(userId);
    }
}

TutorialBot.prototype.playTutorialFor = function (userId) {
    var stepNo = this.users[userId];
    if (stepNo < this.tutorial.length
        && this.tutorial[stepNo].substring(0, 4) !== "wait") {
        var step = this.tutorial[stepNo].replace(/USERID/g, userId);
        this.cmd(step);
        stepNo++;
        this.users[userId] = stepNo;
    }
};

TutorialBot.prototype.react = function (msg) {
    var userId = msg.fromId;
    var cmd = "wait " + userId + " " + msg.message + " " + msg.payload.join(" ");
    var stepNo = this.users[userId] || 0;
    if (stepNo < this.tutorial.length) {
        var step = this.tutorial[stepNo].replace(/USERID/g, userId);
        if (step === cmd) {
            stepNo++;
            this.users[userId] = stepNo;
        }
    }
};