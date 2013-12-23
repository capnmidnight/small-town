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
var StringDecoder = require("string_decoder").StringDecoder;
var decoder = new StringDecoder("utf8");

module.exports.users = {};
module.exports.npcCatalogue = {};
module.exports.npcCatalogue["Roland"] =
    new ShopKeep("Market", 10,
    {
        "bird": 10,
        "steel-wool": 10,
        "small-potion": 3
    },
    {
        "bird": { "gold": 1 },
        "steel-wool": { "gold": 2 },
        "small-potion": { "gold": 3 }
    });

module.exports.rooms = {};
module.exports.getRoom = function (roomId) {
    if (!this.rooms[roomId]) {
		var serverState = this;
        var data = decoder.write(fs.readFileSync(format("rooms/%s.js", roomId)));
        var room = eval(data);
        room.setId(roomId);
        this.rooms[roomId] = room;
        for(var userId in room.npcs) {
			room.npcs[userId].id = userId;
			if(!this.npcCatalogue[userId]) {
				this.npcCatalogue[userId] = room.npcs[userId];
				this.spawnNPC(userId);
			}
		}
    }
    return this.rooms[roomId];
};

function loadIntoHash(hsh, fileName) {
    fs.readFile(fileName, function (err, data) {
        if (!err) {
            for (var key in hsh)
                delete hsh[key];

            var lines = decoder.write(data).split("\n");
            for (var i = 0; i < lines.length; ++i) {
                var line = lines[i].trim();
                if (line.length > 0) {
                    var parts = line.split(":");
                    if (parts.length == 2) {
                        var name = parts[0];
                        var itemScript = parts[1];
                        hsh[name] = eval(itemScript);
                    }
                }
            }
        }
    });
}

module.exports.itemCatalogue = {};

function loadData() {
    loadIntoHash(module.exports.itemCatalogue, "itemCatalogue.txt");
}

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
		if(hsh[k].setId)
			hsh[k].setId(k);
		else
			hsh[k].id = k; 
	}
}

setIds(module.exports.itemCatalogue);
setIds(module.exports.npcCatalogue);
setIds(module.exports.recipes);

module.exports.pump = function(newConnections)
{
  for(var id in newConnections)
  {
      var roomId = "welcome";
      var hp = 100;
      var items = {"gold":10};
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
    if(!body.db)
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

module.exports.lastSpawn = 0;
module.exports.respawnRate = 1 * 60 * 1000;
module.exports.spawnNPC = function(userId) {
	if(this.users[userId] && this.users[userId].hp <= 0)
		delete this.users[userId];
		
	if (!this.users[userId]) {
		this.users[userId] = this.npcCatalogue[userId].copy();
		this.npcCatalogue[userId].copyTo(this.users[userId]);
	}
};
module.exports.respawn = function () {
    var now = Date.now();
    if ((now - this.lastSpawn) > this.respawnRate) {
        loadData();
        for (var userId in this.npcCatalogue)
			this.spawnNPC(userId);

        for (var roomId in this.rooms) {
            var curItems = {};
            var room = this.getRoom(roomId);
            for (var itemId in room.items)
                curItems[itemId] = room.items[itemId];
            assert.strictEqual(room.db, this.rooms);
            
			room.destroy();			
            room = this.getRoom(roomId);

            for (var itemId in curItems)
                if (!room.items[itemId])
                    room.items[itemId] = curItems[itemId];
        }
        this.lastSpawn = now;
    }
};
