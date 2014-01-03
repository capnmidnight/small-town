var fs = require("fs");
var Body = require("./body.js");
var AIBody = require("./aibody.js");
var Aggressor = require("./aggressor.js");
var Mule = require("./mule.js");
var ShopKeep = require("./shopkeep.js");
var Scavenger = require("./scavenger.js");
var loadRooms = require("./room.js").loadFromDir;
var Exit = require("./exit.js");
var loadItems = require("./item.js").load;
var loadRecipes = require("./recipe.js").load;
var loadBots = require("./bots.js");
var Message = require("./message.js");
var assert = require("assert");
var core = require("./core.js");
var format = require("util").format;

function ServerState() {
    this.users = {};
    this.items = {};
    this.rooms = {};
    this.exits = {};
    this.recipes = {};
    this.lastSpawn = 0;
    this.respawnRate = 1 * 60 * 1000;

    loadItems(this, "data/items.txt");
    loadRecipes(this, "data/recipes.txt");
    loadRooms(this, "rooms");
    loadBots(this);
};
module.exports = ServerState;

ServerState.prototype.isNameInUse = function (name) {
    return this.users[name];
};

ServerState.prototype.getPeopleIn = function (roomId, excludeUserId) {
    return core.values(this.users)
        .filter(function (user) {
            return user.roomId == roomId
                && user.id != excludeUserId;
        });
};

ServerState.prototype.getPerson = function (userId, roomId) {
    var user = this.users[userId];
    if (!roomId || user.roomId == roomId)
        return user;
};

ServerState.prototype.inform = function (message, roomId, excludeUserId) {
    for (var userId in this.users) {
        if (userId != excludeUserId) {
            var user = this.users[userId];
            if (!roomId || user.roomId == roomId)
                user.informUser(message);
        }
    }
};

ServerState.prototype.pump = function () {
    this.respawn();
    this.updateUsers();
    this.saveUsers();
}

ServerState.prototype.respawn = function () {
    var now = Date.now();
    if ((now - this.lastSpawn) > this.respawnRate) {
        for (var userId in this.users)
            this.spawnNPC(userId);

        for (var roomId in this.rooms)
            this.rooms[roomId].spawnItems();

        this.lastSpawn = now;
    }
};

ServerState.prototype.spawnNPC = function (userId) {
    var user = this.users[userId];
    user.hp = user.startHP || user.hp;
};

ServerState.prototype.updateUsers = function () {
    for (var bodyId in this.users) {
        var body = this.users[bodyId];
        if (body.quit) {
            body.socket.disconnect();
            delete this.users[bodyId];
        }
        else {
            body.update();
        }
    }
};

ServerState.prototype.saveUsers = function () {
    for (var bodyId in this.users)
        this.users[bodyId].save();
};
