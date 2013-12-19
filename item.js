var Thing = require("./thing.js");

// Item class
//  - description: a description of the item, for printing in
//          the room or inventory.
//  - equipType: how the item may be used. See equipTypes
//          list below.
//  - strength: for whatever equipType is chosen, this is
//          how well the item can do it.
function Item(db, description, equipType, strength)
{
	Thing.call(this, db, description);
    this.equipType = equipType || "none";
    this.strength = strength || 0;
}

Item.prototype = Object.create(Thing.prototype);

module.exports = Item;
