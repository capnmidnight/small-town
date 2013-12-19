// Item class
//  - description: a description of the item, for printing in
//          the room or inventory.
//  - equipType: how the item may be used. See equipTypes
//          list below.
//  - strength: for whatever equipType is chosen, this is
//          how well the item can do it.
function Item(description, equipType, strength)
{
    this.description = description;
    this.equipType = equipType || "none";
    this.strength = strength || 0;
    this.id = null;
}

module.exports = Item;
