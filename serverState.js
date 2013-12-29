var fs = require("fs");
var Body = require("./body.js");
var AIBody = require("./aibody.js");
var Aggressor = require("./aggressor.js");
var Mule = require("./mule.js");
var ShopKeep = require("./shopkeep.js");
var Scavenger = require("./scavenger.js");
var Room = require("./room.js");
var Exit = require("./exit.js");
var Item = require("./item.js");
var Recipe = require("./recipe.js");
var Message = require("./message.js");
var assert = require("assert");
var core = require("./core.js");
var format = require("util").format;
var serverState = module.exports;
module.exports.users = {};

module.exports.itemCatalogue = {};
Item.load(module.exports.itemCatalogue, "itemCatalogue.txt");

module.exports.npcCatalogue = module.exports.itemCatalogue;
new ShopKeep(module.exports.npcCatalogue, "Market", 10,
{
    "bird": 10,
    "steel-wool": 10,
    "small-potion": 3
},
{
    "bird": { "gold": 1 },
    "steel-wool": { "gold": 2 },
    "small-potion": { "gold": 3 }
}, null, "Roland");
new Scavenger(module.exports.npcCatalogue, "Main-Square", 10, null, null, "Begbie");
new AIBody(module.exports.npcCatalogue, "Main-Square", 10, null, null, "Virginia");
new Mule(module.exports.npcCatalogue, "Main-Square", 10, "naaay", { "apple": 5, "log": 3 }, null, null, "mule");

module.exports.rooms = module.exports.itemCatalogue;
Room.loadFromDir(module.exports.rooms, "rooms");

module.exports.equipTypes = ["head", "eyes", "shoulders", "torso",
    "pants", "belt", "shirt", "forearms", "gloves", "shins",
    "boots", "tool", "necklace", "bracelet"];

module.exports.armorTypes = ["head", "torso", "forearms", "gloves", "shins", "boots"];

module.exports.consumeTypes = ["food", "scroll"];

module.exports.recipes =
{
    "dead-bird": new Recipe(
        { "bird": 1 },
        { "dead-bird": 1, "feather": 5 },
        { "sword": 1 }),
    "sword": new Recipe(
        { "steel-wool": 1, "rusty-metal": 1 },
        { "sword": 1 })
};

module.exports.getPeopleIn = function (roomId) {
    return core.where(
        this.users,
        function (k, v) { return v.roomId; },
        core.equal,
        roomId);
};

function setIds(hsh) {
    for (var k in hsh) {
        if (hsh[k].setId)
            hsh[k].setId(k);
        else
            hsh[k].id = k;
    }
}

setIds(module.exports.itemCatalogue);
setIds(module.exports.npcCatalogue);
setIds(module.exports.recipes);

module.exports.pump = function (newConnections) {
    for (var id in newConnections) {
        var roomId = "welcome";
        var hp = 100;
        var items = { "gold": 10 };
        var equip = null;
        this.users[id] = new Body(roomId, hp, items, equip, id, newConnections[id]);
        var m = new Message(id, "join", null, "chat");
        for (var userId in this.users)
            this.users[userId].informUser(m);
        delete newConnections[id];
    }
    this.respawn();
    for (var bodyId in this.users) {
        var body = this.users[bodyId];
        if (body instanceof Body) {
            if (!body.db)
                body.db = this;
            if (body.quit) {
                body.socket.disconnect();
                delete this.users[bodyId];
            }
            else {
                body.update();
                while (body.inputQ.length > 0)
                    body.doCommand();
            }
        }
    }
}

module.exports.lastSpawn = 0;
module.exports.respawnRate = 1 * 60 * 1000;
module.exports.spawnNPC = function (userId) {
    if (this.users[userId] && this.users[userId].hp <= 0)
        delete this.users[userId];

    if (!this.users[userId]) {
        this.users[userId] = this.npcCatalogue[userId].copy();
    }
};
module.exports.respawn = function () {
    var now = Date.now();
    if ((now - this.lastSpawn) > this.respawnRate) {
        for (var userId in this.npcCatalogue)
            this.spawnNPC(userId);

        for (var roomId in this.rooms) {
            var room = this.rooms[roomId];
            if (room instanceof Room) {
                var items = room.ofType(Item);
                var curItems = {};
                for (var i = 0; i < items.length; ++i) {
                    if (!curItems[items[i].name])
                        curItems[items[i].name] = 0;
                    ++curItems[items[i].name];
                }

                for (var i = 0; i < room.items.length; ++i) {
                    var itemId = room.items[i].itemId;
                    var cur = curItems[itemId];
                    if (!cur)
                        cur = 0;

                    cur -= room.items[i].count;
                    cur *= -1;
                    for (var j = 0; j < cur; ++j)
                        room.addChild(module.exports.itemCatalogue[itemId].copy());
                }
            }
        }
        this.lastSpawn = now;
    }
};
