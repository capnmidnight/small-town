var fs = require("fs");
var Body = require("./body.js");
var AIBody = require("./aibody.js");
var Aggressor = require("./aggressor.js");
var Mule = require("./mule.js");
var ShopKeep = require ("./shopkeep.js");
var Scavenger = require ("./scavenger.js");
var Room = require("./room.js");
var Exit = require("./exit.js");
var Item = require("./item.js");
var Recipe = require("./recipe.js");
var Message = require("./message.js");
var core = require("./core.js");
var format = require("util").format;
var StringDecoder = require("string_decoder").StringDecoder;
var Moniker = require('moniker');
var decoder = new StringDecoder("utf8");

module.exports.users = {};
module.exports.everyone = {};
module.exports.everyone[Moniker.choose()] =
    new ShopKeep("Market", 10,
    {
        "bird": 10,
        "steel-wool": 10,
        "small-potion": 3
    },
    {
        "bird": { "gold": 1 },
        "steel-wool": { "gold": 2 },
        "small-potion": {"gold": 3 }
    });
module.exports.everyone[Moniker.choose()] = new Scavenger("Main Square", 10);
module.exports.everyone[Moniker.choose()] = new AIBody("Main Square", 10);
module.exports.everyone[Moniker.choose()] = new Mule("Main Square", 10, "naaay", { "apple": 5, "log": 3 });

module.exports.rooms = {};
module.exports.getRoom = function (roomId) {
    if (!this.rooms[roomId]) {
        var data = decoder.write(fs.readFileSync(format("rooms/%s.js", roomId)));
        this.rooms[roomId] = eval(data);
    }
    return this.rooms[roomId];
};

module.exports.lastSpawn = 0;
module.exports.respawnRate = 10 * 1000; // 5 minutes worth of milliseconds
module.exports.respawn = function()
{
    var now = Date.now();
    if((now - this.lastSpawn) > this.respawnRate)
    {
        loadData();
        for(var userId in this.everyone)
        {
            if(!this.users[userId])
            {
                this.users[userId] = this.everyone[userId].copy();
                this.everyone[userId].copyTo(this.users[userId]);
            }
        }

        for(var roomId in this.rooms)
        {
            var curItems = {};
            var old = 0;
            for (var itemId in this.rooms[roomId].items) {
                curItems[itemId] = this.rooms[roomId].items[itemId];
                ++old;
            }

            delete this.rooms[roomId];
            var room = this.getRoom(roomId);
            var orig = 0;
            var n = 0;

            for (var itemId in curItems) {
                if (!room.items[itemId]) {
                    ++n;
                    room.items[itemId] = curItems[itemId];
                }
                else ++orig;
            }

            console.log(format("loaded room %s with %d old items: %d original items, %d new items", roomId, old, orig, n));
        }
        this.lastSpawn = now;
    }
};

function loadIntoHash(hsh, fileName){
  fs.readFile(fileName, function(err, data){
    if(!err){
      for(var key in hsh)
        delete hsh[key];

      var lines = decoder.write(data).split("\n");
      for(var i = 0; i < lines.length; ++i){
        var line = lines[i].trim();
        if(line.length > 0) {
          var parts = line.split(":");
          if(parts.length == 2){
            var name = parts[0];
            var itemScript = parts[1];
            hsh[name] = eval(itemScript);
          }
          else{
            console.log(parts.length, line);
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
        { "steel-wool": 3, "rusty-metal": 1 },
        { "sword": 1 })
};

module.exports.getPeopleIn = function (roomId)
{
    return core.where(
        this.users,
        function (k, v) { return v.roomId; },
        core.equal,
        roomId);
};

function setIds(hsh) { for (var k in hsh) hsh[k].id = k; }

setIds(module.exports.itemCatalogue);
setIds(module.exports.everyone);
setIds(module.exports.recipes);
setIds(module.exports.rooms);

module.exports.pump = function(newConnections)
{
  for(var id in newConnections)
  {
      this.users[id] = new Body("welcome", 100, { "gold": 10 }, null, id, newConnections[id]);
      var m = new Message(id, "join");
      for (var userId in this.users)
          this.users[userId].informUser(m);
    delete newConnections[id];
  }
  this.respawn();
  for (var bodyId in this.users) {
    var body = this.users[bodyId];
    if (body.quit) {
      console.log(format("%s quit", bodyId));
      delete this.users[bodyId];
    }
    else {
      body.update();
      while (body.inputQ.length > 0)
        body.doCommand();
    }
  }
}



