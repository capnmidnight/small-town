var Thing = require("../thing.js");
var assert = require("assert");

describe("Thing", function(){
	beforeEach(function(){
		Thing.reset();
	});
	
	describe("ids", function(){
		it("has no ID to start", function(){
			var t = new Thing();
			assert.ok(!t.id);
		});
		
		it("persists ID after set", function(){
			var t = new Thing();
			t.setId("t");
			assert.equal(t.id, "t");
		});
		
		it("fails on second setId", function(){
			var t = new Thing();
			t.setId("t");
			assert.throws(function(){
				t.setId("q");
			});
		});
		
		it("fails if id is reused", function(){
			var t1 = new Thing();
			t1.setId("t");
			var t2 = new Thing();
			assert.throws(function(){
				t2.setId("t");
			});
		});
	});
	
	describe("parents", function(){
		it("has no starting parent", function(){
			var t = new Thing();
			assert.ok(!t.parentId);
		});
		
		it("fails to set parent if no ID is set", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			assert.throws(function(){
				t1.setParent("t2");
			});
		});
		
		it("fails to set parent if only child ID is set", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			assert.throws(function(){
				t1.setParent("t2");
			});
		});
		
		it("fails to set parent if only parent ID is set", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t2.setId("t2");
			assert.throws(function(){
				t1.setParent("t2");
			});
		});
		
		it("does not throw if parent is set after ID is set", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			assert.doesNotThrow(function(){
				t1.setParent("t2");
			});
		});
		
		it("persists parent ID", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent("t2");
			assert.equal(t1.parentId, "t2");
		});
		
		it("allows Thing object directly", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			assert.equal(t1.parentId, "t2");
		});
		
		it("gets nothing if parent not set", function(){
			var t = new Thing();
			assert.ok(!t.getParent());
		});
		
		it("retrieves the same thing", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			var t3 = t1.getParent();
			assert.equal(t3, t2);
		});
		
		it("can be cleared", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			t1.clearParent();
			assert.ok(!t1.getParent());
		});
		
		it("becomes available as child", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			var ts = t2.getChildren();
			assert.equal(ts.indexOf(t1), 0);
		});
		
		it("no longer child once cleared", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.setParent(t2);
			t1.clearParent();
			var ts = t2.getChildren();
			assert.equal(ts.indexOf(t1), -1);
		});
	});
	
	describe("children", function(){
		it("has no starting children", function(){
			var t = new Thing();
			assert.equal(t.children.length, 0);
		});
		
		it("fails to add child if no ID is set", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			assert.throws(function(){
				t1.addChild("t2");
			});
		});
		
		it("fails to add child if only child ID is set", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			assert.throws(function(){
				t1.addChild("t2");
			});
		});
		
		it("fails to add child if only parent ID is set", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t2.setId("t2");
			assert.throws(function(){
				t1.addChild("t2");
			});
		});
		
		it("does not throw if child is added after ID is set", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			assert.doesNotThrow(function(){
				t1.addChild("t2");
			});
		});
		
		it("persists child IDs", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild("t2");
			assert.equal(t1.children.indexOf("t2"), 0);
		});
		
		it("allows Thing object directly", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			assert.equal(t1.children.indexOf("t2"), 0);
		});
		
		it("gets nothing if children not set", function(){
			var t = new Thing();
			assert.equal(t.getChildren().length, 0);
		});
		
		it("retrieves the same thing", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			var ts = t1.getChildren();
			assert.equal(ts.indexOf(t2), 0);
		});
		
		it("can be cleared by id", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			t1.removeChild("t2");
			assert.equal(t1.children.length, 0);
		});
		
		it("doesn't remove innocent bystanders", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			var t3 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.addChild(t2);
			t1.addChild(t3);
			t1.removeChild("t2");
			assert.equal(t1.children.indexOf("t3"), 0);
		});
		
		it("can be cleared by value", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			t1.removeChild(t2);
			assert.equal(t1.children.length, 0);
		});
		
		it("becomes available as parent", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			var t3 = t2.getParent();
			assert.equal(t3, t1);
		});
		
		it("no longer parent once cleared", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t1.addChild(t2);
			t1.removeChild(t2);
			assert.ok(!t2.getParent());
		});		
	});
	
	describe("copying", function(){
		it("preserves prototype", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			var t3 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.equal(t4.__proto__, t1.__proto__);
		});
		
		it("makes deep copy", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			var t3 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.deepEqual(t4, t1);
		});
		
		it("does not copy reference", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			var t3 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.notEqual(t4, t1);
		});
		
		it("does not copy sub-references", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			var t3 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.notEqual(t4.children, t1.children);
		});
		
		it("gets the same parent", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			var t3 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.equal(t4.getParent(), t1.getParent());
		});
		
		it("gets the same children", function(){
			var t1 = new Thing();
			var t2 = new Thing();
			var t3 = new Thing();
			t1.setId("t1");
			t2.setId("t2");
			t3.setId("t3");
			t1.setParent(t2);
			t1.addChild(t3);
			var t4 = t1.copy();
			assert.deepEqual(t4.getChildren(), t1.getChildren());
		});
	});
});
