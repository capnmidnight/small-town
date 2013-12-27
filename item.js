var Thing = require("./thing.js");
var assert = require("assert");
// Item class
//  - description: a description of the item, for printing in
//          the room or inventory.
//  - equipType: how the item may be used. See equipTypes
//          list below.
//  - strength: for whatever equipType is chosen, this is
//          how well the item can do it.
function Item(db, description, equipType, strength) {
    Thing.call(this, db, description);
    this.equipType = equipType || "none";
    this.strength = strength || 0;
}

Item.prototype = Object.create(Thing.prototype);
module.exports = Item;

Item.loadIntoRoom = function (db, roomId, text) {
    var parts = text.split(" ");
    var itemName = parts[0];
    var count = parts[1] * 1;
    assert(db[itemName], "Item " + itemName + " doesn't exist.");
    for (var i = 0; i < count; ++i)
        db[roomId].addChild(db[itemName].copy());
};

Item.prototype.copy = function () {
    var itm = Thing.prototype.copy.call(this);
    itm.id += "-" + Date.now();
    this.db[itm.id] = itm;
    return itm;
}
