// Item class
//  - descrip: a description of the item, for printing in
//          the room or inventory.
//  - equipType: how the item may be used. See equipTypes
//          list below.
//  - strength: for whatever equipType is chosen, this is
//          how well the item can do it.
function Item(descrip, equipType, strength)
{
    this.descrip = descrip;
    this.equipType = equipType;
    this.strength = strength;
    this.id = null;
}

module.exports = Item;
