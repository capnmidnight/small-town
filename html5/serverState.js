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
    + "Try \"take all\" followed by \"make sword\".\n\n") }),

    "Main Square": new Room(
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
            {
                this.users[userId] = this.everyone[userId].copy();
                this.everyone[userId].copyTo(this.users[userId]);
            }
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

module.exports.itemCatalogue =
{
    "hat": new Item("a dashing topper", "head", 1),
    "crab": new Item("chitin is tough", "head", 2),
    "leather-helm": new Item("an olde football helmet", "head", 3),
    "fur-hat": new Item("extremely warm", "head", 4),
    "hard-hat": new Item("used in construction", "head", 5),
    "pot": new Item("usually for sauces", "head", 8),
    "<": new Item("for emoji", "head", 12),
    "steel-helm": new Item("not good in a thunderstorm", "head", 18),
    "viking-helm": new Item("with ram's horn technology", "head", 27),
    "spartan-helm": new Item("plummage ftw", "head", 41),
    "crystal-helm": new Item("extremely hard", "head", 62),
    "winged-helm": new Item("does not grant flight", "head", 93),

    "sunglasses": new Item("cheap, platic things", "eyes", 1),
    "monocole": new Item("ready for the opera", "eyes", 2),
    "glasses": new Item("glass lenses, metal frames", "eyes", 3),
    "goggles": new Item("protects the eyes", "eyes", 5),
    "welding-goggles": new Item("with smoked lenses", "eyes", 8),
    "B": new Item("for emoji", "eyes", 12),
    "visor": new Item("full eye protection", "eyes", 18),

    "towel": new Item("number three of fourty two", "shoulders"),
    "blanket": new Item("a little better than a towel", "shoulders"),
    "wool-coat": new Item("very warm", "shoulders"),
    "brown-cloak": new Item("totally not a blanket you can wear all the time", "shoulders"),
    "green-cloak": new Item("feel one with nature", "shoulders"),
    "red-cape": new Item("vogue", "shoulders"),
    "-": new Item("for emoji", "shoulders"),
    "fur-coat": new Item("less fashion, more rugged", "shoulders"),

    "pillow": new Item("tie it around your chest", "torso", 1),
    "wood-slats": new Item("WRAP it around your chest", "torso", 2),
    "leather-chest": new Item("impact resistant", "torso", 4),
    "reflective-vest": new Item("bright yellow", "torso", 5),
    "cookie-sheet": new Item("kind of charred on the edge", "torso", 8),
    "#": new Item("for emoji", "torso", 16),
    "chain-mail": new Item("made of steel rings", "torso", 32),
    "kevlar": new Item("incredible stopping power", "torso", 64),
    "imperial-breastplate": new Item("adorned with prancing ponies", "torso", 128),

    "corse-pants": new Item("made of sackclothe", "pants", 1),
    "slacks": new Item("made of fine cotton", "pants", 2),
    "jeans": new Item("sturdy work pants", "pants", 4),
    "leather-pants": new Item("for rockstars", "pants", 8),
    "=": new Item("for emoji", "pants", 16),
    "action-pants": new Item("strong canvas pants with great mobility", "pants", 32),
    "speedo": new Item("european-style swimsuit", "pants", 64),
    "silk-pants": new Item("extremely elegant", "pants", 128),

    "rope": new Item("holds up the pants", "belt"),
    "braided-belt": new Item("not very stylish", "belt"),
    "leather-belt": new Item("much more stylish", "belt"),
    "work-belt": new Item("could maybe hold tools", "belt"),
    "utility-belt": new Item("people might ask if your name is Bruce", "belt"),

    "t-shirt": new Item("reads \"whatever\"", "shirt"),
    "hawaiian": new Item("flower-print", "shirt"),
    "dress-shirt": new Item("made of fine cotton", "shirt"),
    "flannel": new Item("helps keep you warm", "shirt"),
    "under-armor": new Item("feel like a superhero", "shirt"),
    "puffy-shirt": new Item("feel like a PIRATE", "shirt"),
    "leather-shirt": new Item("for rockstars", "shirt"),

    "sleeve": new Item("cotton sleeve, to protect from minor cuts", "forearms", 1),
    "lobster-tail": new Item("chitinous forearms", "forearms", 2),
    "magazines": new Item("not pretty, but effective", "forearms", 4),
    "fur-bracer": new Item("fairly decent protection, from cold and blows", "forearms", 8),
    "leather-bracer": new Item("made from cow", "forearms", 16),
    "aluminum-sheet": new Item("recovered from an airplane", "forearms", 32),
    "imperial-bracer": new Item("grizzly bears etched into expertly crafted steel", "forearms", 64),

    "latex": new Item("protects against chemicals", "gloves", 1),
    "leather-gloves": new Item("warming, but pliable", "gloves", 2),
    "mittens": new Item("very warm, but dexterity is lacking", "gloves", 4),
    "work-gloves": new Item("basic leather gloves for working", "gloves", 8),
    "butcher-gloves": new Item("protects against cuts", "gloves", 16),
    "gauntlet": new Item("steel gloves of awesome", "gloves", 32),

    "shin-guards": new Item("worn during certain sporting events", "shins", 1),
    "big-lobster-tail": new Item("it is said that chitin promotes healing", "shins", 2),
    "catalogues": new Item("kind of like magazines, but bigger", "shins", 4),
    "leather-shins": new Item("good for deflecting kicks from todlers", "shins", 8),
    "split-muffler": new Item("thin metal recovered from a vehicle", "shins", 16),
    "bronze-leggings": new Item("made popular during the Roman Empire", "shins", 32),
    "steel-guards": new Item("snakes adorn the front", "shins", 64),

    "chucks": new Item("canvas shoes with a star logo on the side", "boots", 1),
    "dress-shoes": new Item("leather-soled, snappy shoes", "boots", 2),
    "hiking-boots": new Item("sturdy ankle support for mountainous treks", "boots", 4),
    "steel-toed": new Item("used in construction", "boots", 8),
    "cowboy-boots": new Item("made from alligator", "boots", 16),
    "steel-boots": new Item("steel foot-gloves of awesome", "boots", 32),

    "needle": new Item("can only balance two angels on the head", "tool", 1),
    "fishing-pole": new Item("for teaching men to eat for a lifetime", "tool", 1),
    "screwdriver": new Item("this particular one is not a drink", "tool", 2),
    "hammer": new Item("for nails and skulls", "tool", 3),
    "handsaw": new Item("many teeth, so many teeth", "tool", 3),
    "rusty-metal": new Item("a rusty sword", "tool", 5),
    "shovel": new Item("used to butter bread", "tool", 5),
    "pickaxe": new Item("SMASH ROCK SMASH", "tool", 5),
    "butcher-knife": new Item("cuts meat", "tool", 5),
    "hunting-knife": new Item("used to butter bread", "tool", 7),
    "sword": new Item("a basic sword", "tool", 10),
    "axe": new Item("cuts wood", "tool", 15),
    "steel-sword": new Item("it glistens in the sun", "tool", 20),
    "cutlas": new Item("a curved blade for pirates", "tool", 40),
    "excalibur": new Item("doesn't make you King Arthur", "tool", 80),
    "katana": new Item("a great weapon for a great warrior", "tool", 150),

    "bird": new Item("worth two in the shrubbery"),
    "dead-bird": new Item("maybe he's pining for the fjords?"),
    "feather": new Item("bird-hair"),
    "rock": new Item("definitely not a bird"),
    "steel-wool": new Item("very scratchy"),
    "gold": new Item("a yellow metal that seems to be highly valued in these realms"),
    "log": new Item("a section of tree trunk"),
    "plank": new Item("useful in construction"),
    "ore": new Item("dug from the earth"),
    "coal": new Item("also dug from the earth"),
    "crucible": new Item("a ceramic cup of sorts"),
    "ingot": new Item("it's like a brick, made of IRON"),
    "emerald": new Item("a very valuable jewel"),
    "leather": new Item("toughened skin of cow"),
    "thread": new Item("another name for string"),
    "pie-plate": new Item("for the creation of delectable treats"),
    "bottle": new Item("can hold liquids, or secrets"),
    "herbs": new Item("the buds of a special plant"),

    "apple": new Item("fruit", "food", 5),
    "peach": new Item("fruit", "food", 5),
    "blueberries": new Item("fruit", "food", 5),
    "small-potion": new Item("recovers 10 health", "food", 10),
    "apple-pie": new Item("quite yummy", "food", 20),
    "peach-pie": new Item("quite yummy", "food", 20),
    "blueberry-pie": new Item("quite yummy", "food", 20),
    "large-potion": new Item("recovers 50 health", "food", 50)
};

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
