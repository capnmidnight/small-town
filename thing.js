var assert = require('assert');
var ServerState = require("./serverState.js");
/*
 * Thing class:
 *  All in-game objects eventually extend Thing. Things is an object a
 *  more useful base-class than JavaScript's own Object. For one thing,
 *  it can manage to make its own deep copies of objects, which is
 *  useful when dealing with game data as templates for instanced data
 *  spawned over time.
 * 
 *  - db: a database of all Things.
 *  - table: the name of the table to which to save This thing
 *  - id: the id to use for this Thing.
 *  - description (optional): every Thing has a physical meaning to it,
 *      that is expressed through a description. For now, this is just
 *      prose text. One day, it might be more.
 */
function Thing(db, table, id, description) {
    assert(db, "Need a database object");
	assert(db.newConnections, "DB has to be a ServerState object.");
    assert(table, "Need a table name");
    assert(db[table], "Table needs to exist: " + table);
    assert(id, "Need an object ID.");
    assert.ok(!db[table][id], "Can't reuse a Thing's ID: " + id);
    
    this.db = db;
    this.id = id;
    this.db[table][this.id] = this;
    this.description = description || "(UNKNOWN)";
}

//satisfy Node.js' odd module system.
module.exports = Thing;

/*
 * Thing::copy method:
 *  Creates a deep-copy of a this object. The copy should have the same
 *  prototype as this object, and should satisfy assert.deepEqual
 */
Thing.prototype.copyTo = function(db, table) {
    var oldDb = this.db;
    var oldTable = this.table;
    this.db = null;
    this.table = null;
    var obj = Object.create(this.__proto__);
    var dat = JSON.parse(JSON.stringify(this));
    for(var key in dat)
        obj[key] = dat[key];
    this.db = oldDb;
    this.table = oldTable;
    obj.db = db;
    obj.table = oldTable;
    return obj;
};
