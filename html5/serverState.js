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

module.exports.everywhere =
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
    + "Try \"take all\" followed by \"make sword\".\n\n") },
               { "steel-wool": 3, "rusty-metal": 1, "helmet": 1 }),

    "mainSquare": new Room(
          "Main Square\n\n\n\n"
        + "Welcome! You made it! There is nowhere else to go. You are stuck here.")
};

module.exports.equipTypes = ["head", "eyes", "shoulders", "torso",
    "pants", "belt", "shirt", "biceps", "forearms", "hands", "thighs",
    "calves", "feet", "tool", "throwable", "necklace", "bracelet"];

module.exports.armorTypes = ["head", "torso", "biceps", "forearms", "hands",
    "thighs", "calves", "feet"];

module.exports.consumeTypes = ["potion", "food", "scroll"];

module.exports.everything =
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

module.exports.everyway =
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
        this.everyone,
        function (k, v) { return v.roomId; },
        core.equal,
        roomId);
};

function setIds(hsh) { for (var k in hsh) hsh[k].id = k; }

setIds(module.exports.everything);
setIds(module.exports.everywhere);
setIds(module.exports.everyone);
setIds(module.exports.everyway);
