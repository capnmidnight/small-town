var Thing = require("../thing.js");
var assert = require("assert");

describe("Thing", function(){
	var db;
	beforeEach(function(){
		db = {};
	});
	
	it("fails without db", function(){
		assert.throws(function(){
			new Thing();
		});
	});
	
	describe("ids", function(){
		it("has no ID to start", function(){
			var t = new Thing(db);
			assert.ok(!t.id);
		});
		
		it("persists ID after set", function(){
			var t = new Thing(db);
			t.setId("t");
			assert.strictEqual(t.id, "t");
		});
		
		it("fails on second setId", function(){
			var t = new Thing(db);
			t.setId("t");
			assert.throws(function(){
				t.setId("q");
			});
		});
		
		it("fails if id is reused", function(){
			var t1 = new Thing(db);
			t1.setId("t");
			var t2 = new Thing(db);
			assert.throws(function(){
				t2.setId("t");
			});
		});
	});
	
	describe("parents", function(){
		it("has no starting parent", function(){
			var t = new Thing(db);
			assert.ok(!t.parentId);
		});
		
		it("doesn't error on empty clearing of parent", function(){
			var t = new Thing(db);
			assert.doesNotThrow(function(){
				t.clearParent();
			});
		});
		
		it("fails to set parent if no ID is set", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			assert.throws(function(){
				t1.setParent("t2");
			});
		});
		
		it("two Things share a db", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			assert.strictEqual(t1.db, t2.db);
		});
		
		it("fails to set parent if only child ID is set", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			assert.throws(function(){
				t1.setParent("t2");
			});
		});
		
		it("fails to set parent if only parent ID is set", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t2.setId("t2");
			assert.throws(function(){
				t1.setParent("t2");
			});
		});
		
		it("does not throw if parent is set after ID is set", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			assert.doesNotThrow(function(){
				t1.setParent("t2");
			});
		});
		
		it("persists parent ID", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent("t2");
			assert.strictEqual(t1.parentId, "t2");
		});
		
		it("allows Thing object directly", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			assert.strictEqual(t1.parentId, "t2");
		});
		
		it("gets nothing if parent not set", function(){
			var t = new Thing(db);
			assert.ok(!t.getParent());
		});
		
		it("retrieves the same thing", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			var t3 = t1.getParent();
			assert.strictEqual(t3, t2);
		});
		
		it("can be cleared", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			t1.clearParent();
			assert.ok(!t1.getParent());
		});
		
		it("becomes available as child", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			var ts = t2.getChildren();
			assert.strictEqual(ts.indexOf(t1), 0);
		});
		
		it("no longer child once cleared", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			t1.clearParent();
			var ts = t2.getChildren();
			assert.strictEqual(ts.indexOf(t1), -1);
		});
	});
	
	describe("children", function(){
		it("has no starting children", function(){
			var t = new Thing(db);
			assert.strictEqual(t.children.length, 0);
		});
		
		it("fails to add child if no ID is set", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			assert.throws(function(){
				t1.addChild("t2");
			});
		});
		
		it("fails to add child if only child ID is set", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			assert.throws(function(){
				t1.addChild("t2");
			});
		});
		
		it("fails to add child if only parent ID is set", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t2.setId("t2");
			assert.throws(function(){
				t1.addChild("t2");
			});
		});
		
		it("fails to add child if child is not a Thing", function(){
			var t1 = new Thing(db);
			t1.setId("t1");
			var obj = {id:"obj", clearParent: function(){}};
			db.obj = obj;
			assert.throws(function(){
				t1.addChild(obj);
			});
		});
		
		it("does not throw if child is added after ID is set", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			assert.doesNotThrow(function(){
				t1.addChild("t2");
			});
		});
		
		it("persists child IDs", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild("t2");
			assert.strictEqual(t1.children.indexOf("t2"), 0);
		});
		
		it("allows Thing object directly", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			assert.strictEqual(t1.children.indexOf("t2"), 0);
		});
		
		it("allows subclasses of Thing", function(){
			var t1 = new Thing(db);
			function ThingA(db) { Thing.call(this, db);}
			ThingA.prototype = Object.create(Thing.prototype);
			var t2 = new ThingA(db);
			t1.setId("t1");
			t2.setId("t2");
			assert.doesNotThrow(function(){
				t1.addChild(t2);
				assert.strictEqual(t1.children.indexOf("t2"), 0);
			});
		});
		
		it("gets nothing if children not set", function(){
			var t = new Thing(db);
			assert.strictEqual(t.getChildren().length, 0);
		});
		
		it("retrieves the same thing", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			var ts = t1.getChildren();
			assert.strictEqual(ts.indexOf(t2), 0);
		});
		
		it("can be cleared by id", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			t1.removeChild("t2");
			assert.strictEqual(t1.children.length, 0);
		});
		
		it("doesn't remove innocent bystanders", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.addChild(t2);
			t1.addChild(t3);
			t1.removeChild("t2");
			assert.strictEqual(t1.children.indexOf("t3"), 0);
		});
		
		it("can be cleared by value", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			t1.removeChild(t2);
			assert.strictEqual(t1.children.length, 0);
		});
		
		it("becomes available as parent", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			var t3 = t2.getParent();
			assert.strictEqual(t3, t1);
		});
		
		it("no longer parent once cleared", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			t1.removeChild(t2);
			assert.ok(!t2.getParent());
		});		
	});
	
	describe("copying", function(){
		it("preserves prototype", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.strictEqual(t4.__proto__, t1.__proto__);
		});
		
		it("makes deep copy", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.deepEqual(t4, t1);
		});
		
		it("does not copy reference", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.notEqual(t4, t1);
		});
		
		it("does not copy sub-references", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.notEqual(t4.children, t1.children);
		});
		
		it("gets the same parent", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.strictEqual(t4.getParent(), t1.getParent());
		});
		
		it("gets the same children", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.deepEqual(t4.getChildren(), t1.getChildren());
		});
		
		it("can get one child", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			var t3 = t1.getChild("t2");
			assert.strictEqual(t3, t2);
		});
		
		it("gets null if not a child", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			var t3 = t1.getChild("t3");
			assert.ok(!t3);
		});
	});
	
	describe("Destroy", function(){
		it("fails if ID not set", function(){
			var t1 = new Thing(db);
			assert.throws(function(){
				t1.destroy();
			});
		});
		
		it("removes own parent", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			t1.destroy();
			assert.ok(!t1.parentId);
		});
		
		it("removes child's parent", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			t1.destroy();
			assert.ok(!t3.parentId);
		});
		
		it("removes own children", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			t1.destroy();
			assert.strictEqual(t1.children.length, 0);
		});
		
		it("removes from parent's children", function(){
			var t1 = new Thing(db);
			var t2 = new Thing(db);
			var t3 = new Thing(db);
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			t1.destroy();
			assert.strictEqual(t2.children.length, 0);
		});
		
		it("removes from database", function(){
			var t1 = new Thing(db);
			t1.setId("t1");
			t1.destroy();
			assert.ok(!db["t1"]);
		});
		
		it("allows resetting of ID", function(){
			var t1 = new Thing(db);
			t1.setId("t1");
			t1.destroy();
			assert.doesNotThrow(function(){
				t1.setId("t2");
			});
		});
	});
	
	describe("ofType method", function(){
		function ThingA(db){Thing.call(this, db)}; ThingA.prototype = Object.create(Thing.prototype);
		function ThingB(db){Thing.call(this, db)}; ThingB.prototype = Object.create(Thing.prototype);
		function ThingC(db){ThingB.call(this, db)}; ThingC.prototype = Object.create(ThingB.prototype);
		function ThingD(db){Thing.call(this, db)}; ThingD.prototype = Object.create(Thing.prototype);
		
		var a1, a2, a3,
			b1, b2, b3,
			c1, c2, c3,
			t, db2;
			
		beforeEach(function(){
			var db2 = {};
			t = new Thing(db2); t.setId("t");
			a1 = new ThingA(db2); a1.setId("a1");
			a2 = new ThingA(db2); a2.setId("a2");
			a3 = new ThingA(db2); a3.setId("a3");
			b1 = new ThingB(db2); b1.setId("b1");
			b2 = new ThingB(db2); b2.setId("b2");
			b3 = new ThingB(db2); b3.setId("b3");
			c1 = new ThingC(db2); c1.setId("c1");
			c2 = new ThingC(db2); c2.setId("c2");
			c3 = new ThingC(db2); c3.setId("c3");
			
			t.addChild(a1);
			t.addChild(a2);
			t.addChild(a3);
			t.addChild(b1);
			t.addChild(b2);
			t.addChild(b3);
			t.addChild(c1);
			t.addChild(c2);
			t.addChild(c3);
		});
		
		it("gets everything with root", function(){
			var cs = t.ofType(Thing);
			assert.ok(cs.indexOf(a1) >= 0, "a1 not in array");
			assert.ok(cs.indexOf(a2) >= 0, "a2 not in array");
			assert.ok(cs.indexOf(a3) >= 0, "a3 not in array");
			assert.ok(cs.indexOf(b1) >= 0, "b1 not in array");
			assert.ok(cs.indexOf(b2) >= 0, "b2 not in array");
			assert.ok(cs.indexOf(b3) >= 0, "b3 not in array");
			assert.ok(cs.indexOf(c1) >= 0, "c1 not in array");
			assert.ok(cs.indexOf(c2) >= 0, "c2 not in array");
			assert.ok(cs.indexOf(c3) >= 0, "c3 not in array");
		});
		
		it("gets 1st level subclasses", function(){
			var cs = t.ofType(ThingA);
			assert.ok(cs.indexOf(a1) >= 0, "a1 not in array");
			assert.ok(cs.indexOf(a2) >= 0, "a2 not in array");
			assert.ok(cs.indexOf(a3) >= 0, "a3 not in array");
			
			assert.equal(cs.indexOf(b1), -1, "b1 is in array");
			assert.equal(cs.indexOf(b2), -1, "b2 is in array");
			assert.equal(cs.indexOf(b3), -1, "b3 is in array");
			assert.equal(cs.indexOf(c1), -1, "c1 is in array");
			assert.equal(cs.indexOf(c2), -1, "c2 is in array");
			assert.equal(cs.indexOf(c3), -1, "c3 is in array");
		});
		
		
		it("gets 1st level subclasses and it's subs", function(){
			var cs = t.ofType(ThingB);
						
			assert.equal(cs.indexOf(a1), -1, "a1 is in array");
			assert.equal(cs.indexOf(a2), -1, "a2 is in array");
			assert.equal(cs.indexOf(a3), -1, "a3 is in array");
			
			assert.ok(cs.indexOf(b1) >= 0, "b1 not in array");
			assert.ok(cs.indexOf(b2) >= 0, "b2 not in array");
			assert.ok(cs.indexOf(b3) >= 0, "b3 not in array");
			assert.ok(cs.indexOf(c1) >= 0, "c1 not in array");
			assert.ok(cs.indexOf(c2) >= 0, "c2 not in array");
			assert.ok(cs.indexOf(c3) >= 0, "c3 not in array");
		});
				
		it("gets 2nd level subclass", function(){
			var cs = t.ofType(ThingC);
						
			assert.equal(cs.indexOf(a1), -1, "a1 is in array");
			assert.equal(cs.indexOf(a2), -1, "a2 is in array");
			assert.equal(cs.indexOf(a3), -1, "a3 is in array");
			assert.equal(cs.indexOf(b1), -1, "b1 is in array");
			assert.equal(cs.indexOf(b2), -1, "b2 is in array");
			assert.equal(cs.indexOf(b3), -1, "b3 is in array");
			
			assert.ok(cs.indexOf(c1) >= 0, "c1 not in array");
			assert.ok(cs.indexOf(c2) >= 0, "c2 not in array");
			assert.ok(cs.indexOf(c3) >= 0, "c3 not in array");
		});
		
		it("gets nothing", function(){
			var cs = t.ofType(ThingD);
						
			assert.equal(cs.indexOf(a1), -1, "a1 is in array");
			assert.equal(cs.indexOf(a2), -1, "a2 is in array");
			assert.equal(cs.indexOf(a3), -1, "a3 is in array");
			assert.equal(cs.indexOf(b1), -1, "b1 is in array");
			assert.equal(cs.indexOf(b2), -1, "b2 is in array");
			assert.equal(cs.indexOf(b3), -1, "b3 is in array");
			assert.equal(cs.indexOf(c1), -1, "c1 is in array");
			assert.equal(cs.indexOf(c2), -1, "c2 is in array");
			assert.equal(cs.indexOf(c3), -1, "c3 is in array");
		});
	});
});
