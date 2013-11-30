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

module.exports.users = {};
module.exports.everyone =
{
    "dave": new ShopKeep("mainSquare", 10,
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
    "mark": new Scavenger("mainSquare", 10),
    "carl": new AIBody("mainSquare", 10),
    "doug": new Aggressor("mainSquare", 10, null, { "tool": "sword" })
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
               { "exit": new Exit("mainSquare", "sword",
      "Don't forget to take the items (rusty metal"
    + "and steel-wool) and use them to make a sword.\n\n"
    + "Try \"take all\" followed by \"make sword\".\n\n") }),

    "mainSquare": new Room(
          "Main Square\n\n\n\n"
        + "Welcome! You made it! There is nowhere else to go. You are stuck here.")
};

module.exports.items = {};
module.exports.everything = {"intro" : {"steel-wool": 3, "rusty-metal": 1, "helmet": 1 }};

module.exports.lastSpawn = 0;
module.exports.respawnRate = 5 * 60 * 1000; // 5 minutes worth of milliseconds
module.exports.respawn = function()
{
    var now = Date.now();
    if((now - this.lastSpawn) > this.respawnRate)
    {
        for(var userId in this.everyone)
        {
            if(!this.users[userId])
                this.users[userId] = this.everyone[userId].copy();
            this.everyone[userId].copyTo(this.users[userId]);
        }

        for(var roomId in this.rooms)
        {
            if(!this.items[roomId])
                this.items[roomId] = {};
            if(this.everything[roomId])
                for(var itemId in this.everything[roomId])
                    this.items[roomId][itemId] = this.everything[roomId][itemId];
        }
        this.lastSpawn = now;
    }
};

module.exports.equipTypes = ["head", "eyes", "shoulders", "torso",
    "pants", "belt", "shirt", "biceps", "forearms", "hands", "thighs",
    "calves", "feet", "tool", "throwable", "necklace", "bracelet"];

module.exports.armorTypes = ["head", "torso", "biceps", "forearms", "hands",
    "thighs", "calves", "feet"];

module.exports.consumeTypes = ["potion", "food", "scroll"];

module.exports.itemCatalogue =
{
    "rusty-metal": new Item("a rusty sword", "tool", 10),
    "bird": new Item("definitely a bird", "none", 0),
    "dead-bird": new Item("maybe he's pining for the fjords?", "none", 0),
    "feather": new Item("bird-hair", "none", 0),
    "rock": new Item("definitely not a bird", "throwable", 2),
    "garbage": new Item("some junk", "none", 0),
    "shovel": new Item("used to butter bread", "tool", 5),
    "sword": new Item("it glistens in the sun", "tool", 12),
    "steel-wool": new Item("very scratchy", "none", 0),
    "gold": new Item("a yellow metal that seems to be highly valued in these realms", "none", 0),
    "health-potion": new Item("recovers 10 health", "potion", 10),
    "helmet": new Item("a basic helm for protecting your melon.", "head", 10)
};

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
