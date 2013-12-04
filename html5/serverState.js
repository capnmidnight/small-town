var fs = require("fs");
var Body = require("./body.js");
var AIBody = require("./aibody.js");
var Aggressor = require("./aggressor.js");
var ShopKeep = require ("./shopkeep.js");
var Scavenger = require ("./scavenger.js");
var Room = require("./room.js");
var Exit = require("./exit.js");
var Item = require("./item.js");
var Recipe = require("./recipe.js");
var core = require("./core.js");
var format = require("util").format;

module.exports.users = {};
module.exports.everyone =
{
    "dave": new ShopKeep("Main Square", 10,
    {
        "bird": 10,
        "steel-wool": 10,
        "health-potion": 3
    },
    {
        "bird": { "gold": 1 },
        "steel-wool": { "gold": 2 },
        "health-potion": {"gold": 3}
    }),
    "mark": new Scavenger("Main Square", 10),
    "carl": new AIBody("Main Square", 10),
    "doug": new Aggressor("Main Square", 10, null, { "tool": "sword" })
};

module.exports.rooms =
{
    "welcome": new Room(
      "Welcome!\n\n\n\nWelcome to a very simple, Multi-User\n\n"
    + "Dungeon that I have created. This MUD\n\n"
    + "is almost completely useless at this time.\n\n"
    + "However, you can run around in the few\n\n"
    + "rooms that exist and try to get a feel\n\n"
    + "for things!\n\n",
      {"leave": new Exit("intro")}),

    "intro": new Room(
      "Introduction\n\n\n\nLearning the commands to the game important.\n\n"
    + "You can see all of the commands you're\n\n"
    + "capable of by typing <strong>help</strong> in the command\n\n"
    + "box below and either hitting your enter key\n\n"
    + "or tapping the enter button.\n\n"
    + "\n\n"
    + "You will have to take the items in this room\n\n"
    + "and make a key in order to exit.\n\n",
      { "exit": new Exit("Main Square", "sword",
      "Don't forget to take the items (rusty metal"
    + "and steel-wool) and use them to make a sword.\n\n"
    + "Try \"take all\" followed by \"make sword\".\n\n") },
      {"steel-wool": 3, "rusty-metal": 1, "helmet": 1 }),

    "Main Square": new Room(
          "Main Square\n\n\n\n"
        + "Welcome! You made it! There is nowhere else to go. You are stuck here.")
};

module.exports.lastSpawn = 0;
module.exports.respawnRate = 5 * 60 * 1000; // 5 minutes worth of milliseconds
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
            var room = this.rooms[roomId];
            for (var itemId in room.originalItems)
                room.items[itemId] = room.originalItems[itemId];
        }
        this.lastSpawn = now;
    }
};

function loadIntoHash(hsh, fileName){
  fs.readFile(fileName, function(err, data){
    if(!err){
      for(var key in hsh)
        delete hsh[key];

      var lines = String.prototype.split.call(data, "\n");
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



