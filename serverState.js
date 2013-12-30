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

function ServerState()
{
	this.users = {};
	this.newConnections = {};
	this.items = {};
	this.rooms = {};
	this.recipes = {};
	this.lastSpawn = 0;
	this.respawnRate = 1 * 60 * 1000;
	
	Item.load(this, "itemCatalogue.txt");
	Room.loadFromDir(this, "rooms");
	
	new ShopKeep(this, "Market", 10, {"bird": 10, "steel-wool": 10, "small-potion": 3 },	{ "bird": { "gold": 1 }, "steel-wool": { "gold": 2 }, "small-potion": { "gold": 3 }}, null, "Roland");
	new Scavenger(this, "Main-Square", 10, null, null, "Begbie");
	new AIBody(this, "Main-Square", 10, null, null, "Virginia");
	new Mule(this, "Main-Square", 10, "naaay", { "apple": 5, "log": 3 }, null, null, "mule");
	new Recipe(this, "dead-bird", "a bird that is not alive", { "bird": 1 }, { "dead-bird": 1, "feather": 5 }, { "sword": 1 });
	new Recipe(this, "sword", "meh", { "steel-wool": 1, "rusty-metal": 1 }, { "sword": 1 });
};
module.exports = ServerState;

ServerState.prototype.isNameInUse = function(name){
	return this.users[name] || this.newConnections[name];
};

ServerState.prototype.addConnection = function(name, socket){
	this.newConnections[name] = socket;
}

ServerState.prototype.getPeopleIn = function (roomId, excludeUserId) {
	return core.values(this.users)
		.filter(function(user){
			return user.roomId == roomId 
				&& user.id != excludeUserId;
		});
};

ServerState.prototype.getPerson = function(userId, roomId){
	var user = this.users[userId];
	if(!roomId || this.user.roomId == roomId)
		return user;
};

ServerState.prototype.inform = function(message, roomId){
    for(var userId in this.users){
		var user = this.users[userId];
		if(!roomId || user.roomId == roomId)
			user.informUser(message);
	}
};

ServerState.prototype.pump = function () {
    for (var id in this.newConnections) {
        var roomId = "welcome";
        var hp = 100;
        var items = { "gold": 10 };
        var equip = null;
        this.users[id] = new Body(this, roomId, hp, items, equip, id, this.newConnections[id]);
        var m = new Message(id, "join", null, "chat");
        for (var userId in this.users)
            this.users[userId].informUser(m);
        delete this.newConnections[id];
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

ServerState.prototype.spawnNPC = function (userId) {
	var user = this.db[userId];
	if(user instanceof AIBody)
		if (user.hp <= 0)
			user.hp = 10;
};

ServerState.prototype.spawnRoom = function(roomId) {
	var room = this.db[roomId];
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
				room.addChild(this.db[itemId].copy());
		}
	}
};

ServerState.prototype.respawn = function () {
    var now = Date.now();
    if ((now - this.lastSpawn) > this.respawnRate) {
        for (var userId in this.db)
            this.spawnNPC(userId);

        for (var roomId in this.db)
			this.spawnRoom(roomId);
			
        this.lastSpawn = now;
    }
};
