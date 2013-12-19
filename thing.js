var assert = require('assert');
/*
 * Thing class:
 * 	All in-game objects eventually extend Thing. Things is an object a
 *  more useful base-class than JavaScript's own Object. For one thing,
 *  it can manage to make its own deep copies of objects, which is
 *  useful when dealing with game data as templates for instanced data
 *  spawned over time.
 */
function Thing() {
	this.id = null;
	this.parentId = null;
	this.children = [];
}

//satisfy Node.js' odd module system.
module.exports = Thing;

/*
 * Thing::setId method:
 * 	Keep track of every object by name, so that objects can be
 *  referenced without incurring cycles.
 * 
 *  Once an ID has been set, it cannot be changed. An assertion error
 *  will occur if you try.
 */
everything = {};
Thing.prototype.setId = function(id) {
	// don't allow reusing a Thing's id
	assert.ok(!everything[id], "Can't reuse a Thing's ID.");
	// don't allow resetting a Thing's id
	assert.ok(!this.id, "Can't reset a Thing's ID.");
	this.id = id;
	everything[this.id] = this;
};

Thing.reset = function(){
	everything = {};
};

/*
 * Thing::setParent method:
 * 	All Things can exist in a graph hiearchy with each other. This thing
 *  must be initialized with an ID first. An assertion error will be
 *  thrown if it is not.
 */
Thing.prototype.setParent = function(id) {
	assert.ok(this.id, "Thing ID hasn't been initialized yet");
	if(id.id)
		id = id.id;
	var newParent = everything[id];
	assert.ok(newParent, "Parent must exist");
	this.clearParent();
	if(newParent && this.id)
		newParent.addChild(this.id);
};

Thing.prototype.getParent = function() {
	return everything[this.parentId];
}

/*
 * Thing::addChild method:
 * 	All Things can exist in a graph hiearchy with each other. This thing
 *  must be initialized with an ID first. An assertion error will be
 *  thrown if it is not.
 */
Thing.prototype.addChild = function(id) {
	assert.ok(this.id, "Thing ID hasn't been initialized yet");
	if(id.id)
		id = id.id;
	var child = everything[id];
	assert.ok(child, "Child doesn't exist");
	child.clearParent();
	child.parentId = this.id;
	this.children.push(id);
	this.children.sort();
};

Thing.prototype.getChildren = function(){
	return this.children.map(function(id){return everything[id];});
};

/* Thing::clearParent method:
 * 	Remove this Thing from a graph. If not in a graph, does nothing.
 */
Thing.prototype.clearParent = function() {
	if(this.parentId) {
		var parent = everything[this.parentId];
		if(parent)
			parent.removeChild(this.id);
	}	
};

/* Thing::clearParent method:
 * 	Remove this Thing from a graph. If not in a graph, does nothing.
 */
Thing.prototype.removeChild = function(id) {
	if(id.id)
		id = id.id;
	var child = everything[id];
	if(child)
		child.parentId = null;
		
	var i = this.children.indexOf(id);
	if(i > -1) {
		if(this.children.length > 1) {
			this.children[i] = this.children.pop();
			this.children.sort();
		}
		else {
			this.children = [];
		}
	}
};

/*
 * Thing::copy method:
 * 	Creates a deep-copy of a this object. The copy should have the same
 * 	prototype as this object, and should satisfy assert.deepEqual
 */
Thing.prototype.copy = function() {
	var obj = Object.create(this.__proto__);
	var dat = JSON.parse(JSON.stringify(this));
	for(var key in dat)
		obj[key] = dat[key];
	assert.deepEqual(this, obj);
	return obj;
};

/*
 * Thing::destroy method:
 * 	Get rid of all references to the Thing in the graph. Don't know if
 *  this will actually be useful or not.
 */
Thing.prototype.destroy = function() {
	this.clearParent();
	for(var i = 0; i < this.children.length; ++i)
		everything[this.children[i]].parentId = null;
	this.children = [];
	delete everything[this.id];
	this.id = null;
};
