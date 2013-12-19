var assert = require('assert');
/*
 * Thing class:
 *  All in-game objects eventually extend Thing. Things is an object a
 *  more useful base-class than JavaScript's own Object. For one thing,
 *  it can manage to make its own deep copies of objects, which is
 *  useful when dealing with game data as templates for instanced data
 *  spawned over time.
 * 
 *  - db: a database of all Things.
 *  - description (optional): every Thing has a physical meaning to it,
 *      that is expressed through a description. For now, this is just
 *      prose text. One day, it might be more.
 */
function Thing(db, description) {
    this.db = db;
    this.description = description || "(UNKNOWN)";
    this.id = null;
    this.parentId = null;
    this.children = [];
}

//satisfy Node.js' odd module system.
module.exports = Thing;
/*
 * Thing::setId method:
 *  Keep track of every object by name, so that objects can be
 *  referenced without incurring cycles.
 * 
 *  Once an ID has been set, it cannot be changed. An assertion error
 *  will occur if you try.
 * 
 *  - id: the id to use for this Thing.
 */
Thing.prototype.setId = function(id) {
    // don't allow reusing a Thing's id
    assert.ok(!this.db[id], "Can't reuse a Thing's ID.");
    // don't allow resetting a Thing's id
    assert.ok(!this.id, "Can't reset a Thing's ID.");
    this.id = id;
    this.db[this.id] = this;
};

/*
 * Thing::setParent method:
 *  All Things can exist in a graph hiearchy with each other. This thing
 *  must be initialized with an ID first. An assertion error will be
 *  thrown if it is not.
 * 
 *  - id: the id of the parent object, or the parent object, if it has
 *      an id set.
 */
Thing.prototype.setParent = function(id) {
    assert.ok(this.id, "Thing ID hasn't been initialized yet");
    if(id.id)
        id = id.id;
    var newParent = this.db[id];
    assert.ok(newParent, "Parent must exist");
    this.clearParent();
    if(newParent && this.id)
        newParent.addChild(this.id);
};

/*
 * Thing::getParent method:
 *  Retrieve the parent Thing
 */
Thing.prototype.getParent = function() {
    return this.db[this.parentId];
}

/*
 * Thing::addChild method:
 *  All Things can exist in a graph hiearchy with each other. This thing
 *  must be initialized with an ID first. An assertion error will be
 *  thrown if it is not.
 *  - id: the id of the child object, or the child object, if it has
 *      an id set.
 */
Thing.prototype.addChild = function(id) {
    assert.ok(this.id, "Thing ID hasn't been initialized yet");
    if(id.id)
        id = id.id;
    var child = this.db[id];
    assert.ok(child, "Child doesn't exist");
    child.clearParent();
    child.parentId = this.id;
    this.children.push(id);
};

/*
 * Thing::getChildren method:
 *  Retrieve all of the child Things
 */
Thing.prototype.getChildren = function(){
    var db = this.db;
    return this.children.map(function(id){return db[id];});
};

/* Thing::clearParent method:
 *  Remove this Thing from a graph. If not in a graph, does nothing.
 */
Thing.prototype.clearParent = function() {
    if(this.parentId) {
        var parent = this.db[this.parentId];
        if(parent)
            parent.removeChild(this.id);
    }   
};

/* Thing::clearParent method:
 *  Remove this Thing from a graph. If not in a graph, does nothing.
 * 
 *  - id: the id of the child object, or the child object, if it has
 *      an id set.
 */
Thing.prototype.removeChild = function(id) {
    if(id.id)
        id = id.id;
    var child = this.db[id];
    if(child)
        child.parentId = null;
        
    var i = this.children.indexOf(id);
    if(i > -1) {
        this.children = this.children
            .slice(0, i)
            .concat(this.children.slice(i+1));
    }
};

/*
 * Thing::copy method:
 *  Creates a deep-copy of a this object. The copy should have the same
 *  prototype as this object, and should satisfy assert.deepEqual
 */
Thing.prototype.copy = function() {
    var db = this.db;
    this.db = null;
    var obj = Object.create(this.__proto__);
    var dat = JSON.parse(JSON.stringify(this));
    for(var key in dat)
        obj[key] = dat[key];
    assert.deepEqual(this, obj);
    obj.db = db;
    this.db = db;
    return obj;
};

/*
 * Thing::destroy method:
 *  Get rid of all references to the Thing in the graph. Don't know if
 *  this will actually be useful or not.
 */
Thing.prototype.destroy = function() {
	assert.ok(this.id, "Can't destroy an uninitialized object");
    this.clearParent();
    for(var i = 0; i < this.children.length; ++i)
        this.db[this.children[i]].parentId = null;
    this.children = [];
    delete this.db[this.id];
    this.id = null;
};
