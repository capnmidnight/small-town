// Item class
//	- descrip: a description of the item, for printing in
// 			the room or inventory.
//	- equipType: how the item may be used. See equipTypes 
//			list below.
//  - strength: for whatever equipType is chosen, this is
//			how well the item can do it.
function Item(descrip, equipType, strength)
{
    this.descrip = descrip;
    this.equipType = equipType;
    this.strength = strength;
    this.id = null;
}

var equipTypes = ["head", "eyes", "shoulders", "torso",
"pants", "belt", "shirt", "biceps", "forearms", "hands", "thighs",
"calves", "feet", "tool", "throwable", "necklace", "bracelet"];

var consumeTypes = ["potion", "food", "scroll"];

var itemCatalogue = {
    "sword": new Item("a rusty sword", "tool", 10),
    "bird": new Item("definitely a bird", "none", 0),
    "dead-bird": new Item("maybe he's pining for the fjords?", "none", 0),
    "feather": new Item("bird-hair", "none", 0),
    "rock": new Item("definitely not a bird", "throwable", 2),
    "garbage": new Item("some junk", "none", 0),
    "shovel": new Item("used to butter bread", "tool", 5),
    "shiny-sword": new Item("it glistens in the sun", "tool", 12),
    "steel-wool": new Item("very scratchy", "none", 0),
    "gold": new Item("a yellow metal that seems to be highly valued in these realms", "none", 0),
    "health-potion": new Item("recovers 10 health", "potion", 10)
};

setIds(itemCatalogue);
