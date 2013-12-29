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
 *  - id: the id to use for this Thing.
 *  - description (optional): every Thing has a physical meaning to it,
 *      that is expressed through a description. For now, this is just
 *      prose text. One day, it might be more.
 */
function Thing(db, id, description) {
    assert.ok(db, "Need a database object");
    this.db = db;
    // don't allow reusing a Thing's id
    assert.ok(!this.db[id], "Can't reuse a Thing's ID: " + id);
    // don't allow resetting a Thing's id
    assert.ok(!this.id, "Can't reset a Thing's ID.");
    this.id = id;
    this.db[this.id] = this;
    this.description = description || "(UNKNOWN)";
    this.parentId = null;
    this.children = [];
}

//satisfy Node.js' odd module system.
module.exports = Thing;

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
    assert.ok(child instanceof Thing, "Child must be a subtype of Thing");
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

/*
 * Thing::getChild method:
 *  If id refers to a child object of this Thing, returns the full
 *  object reference. Otherwise, returns null;
 * 
 *  - id: the id of the child object
 */
Thing.prototype.getChild = function(id){
	if(this.children.indexOf(id) > -1)
		return this.db[id];
	return null;
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
    obj.db = db;
    this.db = db;
    return obj;
};

/*
 * Thing::ofType method:
 *  Retrieves an array of child Things that are of the type specified.
 * 
 *  - t: a function reference to the type of the object to retrieve.
 */
Thing.prototype.ofType = function(t){
	var db = this.db;
	return this.children
		.map(function(id){ return db[id]; })
		.filter(function(c){ return c instanceof t; });
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
