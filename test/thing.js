var Thing = require("../thing.js");
var assert = require("assert");

describe("Thing", function(){
	var db;
	beforeEach(function(){
		db = {};
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
});
