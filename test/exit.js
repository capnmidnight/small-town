var Exit = require("../exit.js");
var Thing = require("../thing.js");
var Room = require("../room.js");
var Body = require("../body.js");
var Item = require("../item.js");
var assert = require("assert");
var format = require("util").format;

describe("between two rooms", function(){
    var db = null;
    var room1 = null;
    var room2 = null;
    var item1 = null;
    var item2 = null;
    
    beforeEach(function(){
        db = {};
        room1 = new Room(db, "room1");
        room2 = new Room(db, "room2");
        item1 = new Item(db, "key");
        item2 = new Item(db, "jewel");
    });

    describe("degenerate conditions", function(){
        it("requires db", function(){
            assert.throws(function(){
                new Exit(null, "north", "room1", "room2");
            });
        });
        
        it("requires id", function(){
            assert.throws(function(){
                new Exit(db, null, "room1", "room2");
            });
        });
        
        it("doesn't allow empty object as id", function(){
            assert.throws(function(){
                new Exit(db, {}, "room1", "room2");
            });
        });
        
        it("doesn't allow id'd object as id", function(){
            assert.throws(function(){
                new Exit(db, {id:"xyz"}, "room1", "room2");
            });
        });
        
        it("requires from roomId", function(){
            assert.throws(function(){
                new Exit(db, "north", null, "room2");
            });
        });
        
        it("requires to roomId", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1");
            });
            
            assert.throws(function(){
                new Exit(db, "north", "room1", null);
            });
        });
        
        it("requires an existing from room", function(){
            assert.throws(function(){
                new Exit(db, "north", "nonRoomId", "room2");
            });
        });
        
        it("requires an existing to room", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1", "nonRoomId");
            });
        });
        
        it("doesn't accept undefined-item as cloak", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1", "room2", {cloak: "hat"});
            });            
        });
        
        it("doesn't accept undefined-item array as cloak", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1", "room2", {cloak: ["hat", "cat"]});
            });            
        });
        
        it("doesn't accept ANY undefined-item array as cloak", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1", "room2", {cloak: [item1, "cat"]});
            });            
        });
        
        it("doesn't accept undefined-item as lock", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1", "room2", {lock: "hat"});
            });            
        });
        
        it("doesn't accept undefined-item array as lock", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1", "room2", {lock: ["hat", "cat"]});
            });            
        });
        
        it("doesn't accept ANY undefined-item array as lock", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1", "room2", {lock: [item1, "cat"]});
            });            
        });
    });
    
    describe("mixing refs and ids", function(){
        it("allows id for from and ref for to", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", "room1", room2);
            });
        });
        
        it("allows ref for from and id for to", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, "room2");
            });
        });
        
        it("allows ref for both", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, room2);
            });
        });
        
        it("allows id for cloak", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, room2, {cloak: "key"});
            });
        });
        
        it("allows id array for cloak", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, room2, {cloak: ["key", "jewel"]});
            });
        });
        
        it("allows ref for cloak", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, room2, {cloak: item1});
            });
        });
        
        it("allows ref array for cloak", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, room2, {cloak: [item1, item2]});
            });
        });
    });
    
    describe("uni-directional exits", function(){
        var x = null;
        
        beforeEach(function(){
            x = new Exit(db, "south", "room1", "room2", {oneWay: true});
        });
    
        it("doesn't set reverseId when asked", function(){
            assert(!x.reverseId);
        });
    
        it("creates the specified direction", function(){
            assert.equal(room1.ofType(Exit).length, 1, 
                "there should be an exit in room 1.");
        });
    
        it("doesn't create bi-drectional exits", function(){                        
            assert.equal(room2.ofType(Exit).length, 0, 
                "there shouldn't be any exits in room 2.");
        });
    });

    describe("when the user has no items", function(){
        var user = null;
        beforeEach(function(){
            user = new Body();
        });
        
        describe("with one item for the cloak", function(){
            var x = null;
            var r = null;
            beforeEach(function(){
                x = new Exit(db, "south", "room2", "room1", {cloak: ["key"]});
                r = db[x.reverseId];
            });
        
            it("isn't visible if the cloak is set", function(){
                assert(!x.isVisibleTo(user));
            });
            
            it("is locked if not visible", function(){
                assert(!x.isOpenTo(user));
            });
            
            it("becomes visible if user has item", function(){
                user.items.key = 1;
                assert(x.isVisibleTo(user));
            });
            
            it("is visible even if the item is equipped", function(){
                user.equipment.key = 1;
                assert(x.isVisibleTo(user));
            });
            
            it("is unlocked if visible", function(){
                user.items.key = 1;
                assert(x.isOpenTo(user));
            });
            
            it("shares cloak with reverse direction", function(){
                assert.deepEqual(x.cloak, r.cloak);
            });
        });
        
        describe("with two items for the cloak", function(){        
            var x = null;
            var r = null;
            beforeEach(function(){
                x = new Exit(db, "south", "room2", "room1", {cloak: ["key", "jewel"]});
                r = db[x.reverseId];
            });
        
            it("isn't visible if user only has some of the cloak items", function(){
                user.items.key = 1;
                assert(!x.isVisibleTo(user));
            });
            
            it("becomes visible if user has all of the cloak items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                assert(x.isVisibleTo(user));
            });
            
            it("still visible if user has some of the key equipped", function(){
                user.items.key = 1;
                user.equipment.jewel = 1;
                assert(x.isVisibleTo(user));
            });
            
            it("still visible if user has all of the key equipped", function(){
                user.equipment.key = 1;
                user.equipment.jewel = 1;
                assert(x.isVisibleTo(user));
            });
            
            it("still visible if user has more than one of one of the items", function(){
                user.items.key = 23;
                user.items.jewel = 1;
                assert(x.isVisibleTo(user));
            });
            
            it("still visible if user has more than one of each items", function(){
                user.items.key = 23;
                user.items.jewel = 17;
                assert(x.isVisibleTo(user));
            });
            
            it("still visible if user has extra items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                user.items.hat = 1;
                assert(x.isVisibleTo(user));
            });
            
            it("shares cloak with reverse direction", function(){
                assert.deepEqual(x.cloak, r.cloak);
            });
            
            it("is visible at any time", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88, 30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(x.isVisibleAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
            
            it("is open at any time", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88, 30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(x.isOpenAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
        });
        
        describe("with a basic timed cloak", function(){
			var x = null;
			beforeEach(function(){
				x = new Exit(db, "east", room1, room2, {timeCloak: {period: 60}});
			});
			
			it("is visible to the user", function(){
				assert(x.isVisibleTo(user));
			});
			
			it("is visible", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88];
				for(var i = 0; i < t.length; ++i)
					assert(x.isVisibleAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
			
			it("is not visible", function(){
				var t = [30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isVisibleAt(t[i]), 
						format("expected to not be visible at %ds", t[i]));
			});
		});
        
        describe("with a shifted timed cloak", function(){
			var x = null;
			beforeEach(function(){
				x = new Exit(db, "east", room1, room2, {timeCloak: {period: 60, shift: 12}});
			});
			
			it("is visible to the user", function(){
				assert(x.isVisibleTo(user));
			});
			
			it("is visible", function(){
				var t = [12, 22, 32, 41, 72, 73, 82, 100];
				for(var i = 0; i < t.length; ++i)
					assert(x.isVisibleAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
			
			it("is not visible", function(){
				var t = [0, 11, 42, 47, 57, 71, 102, 104, 112, 131];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isVisibleAt(t[i]), 
						format("expected to not be visible at %ds", t[i]));
			});
		});
        
        describe("with one item for the lock", function(){
            var x = null;
            var r = null;
            beforeEach(function(){
                x = new Exit(db, "south", "room2", "room1", {lock: ["key"]});
                r = db[x.reverseId];
            });
            
            it("persists lock message", function(){
                var x2 = new Exit(db, "north", room1, room2, {lock: item1, lockMessage: "lockity mclocked"});
                assert.equal(x2.lockMessage, "lockity mclocked");
            });
        
            it("is locked if the lock is set", function(){
                assert(!x.isOpenTo(user));
            });
            
            it("becomes unlocked if user has item", function(){
                user.items.key = 1;
                assert(x.isOpenTo(user));
            });
            
            it("still unlocked if user has item equipped", function(){
                user.equipment.key = 1;
                assert(x.isOpenTo(user));
            });
            
            it("shares lock with reverse direction", function(){
                assert.deepEqual(x.lock, r.lock);
            });
        });
        
        describe("with two items for the lock", function(){        
            var x = null;
            var r = null;
            beforeEach(function(){
                x = new Exit(db, "south", "room2", "room1", {lock: ["key", "jewel"]});
                r = db[x.reverseId];
            });
        
            it("is locked if user only has some of the cloak items", function(){
                user.items.key = 1;
                assert(!x.isOpenTo(user));
            });
            
            it("becomes unlocked if user has all of the cloak items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                assert(x.isOpenTo(user));
            });
            
            it("still unlocked if user has more than one of the items", function(){
                user.items.key = 23;
                user.items.jewel = 1;
                assert(x.isOpenTo(user));
            });
            
            it("still unlocked if user has one of the items equipped", function(){
                user.equipment.key = 1;
                user.items.jewel = 1;
                assert(x.isOpenTo(user));
            });
            
            it("still unlocked if user has all of the items equipped", function(){
                user.equipment.key = 1;
                user.equipment.jewel = 1;
                assert(x.isOpenTo(user));
            });
            
            it("still unlocked if user has more than one of each items", function(){
                user.items.key = 23;
                user.items.jewel = 17;
                assert(x.isOpenTo(user));
            });
            
            it("still unlocked if user has extra items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                user.items.hat = 1;
                assert(x.isOpenTo(user));
            });
            
            it("displays \"(LOCKED)\"", function(){
                assert.equal(x.describe(user, 0), "south to room1 (LOCKED)");
            });
            
            it("no longer displays \"(LOCKED)\"", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                assert.equal(x.describe(user, 0), "south to room1");
            });
            
            it("no longer displays \"(LOCKED)\", even when equipped", function(){
                user.equipment.key = 1;
                user.equipment.jewel = 1;
                assert.equal(x.describe(user, 0), "south to room1");
            });
            
            it("shares lock with reverse direction", function(){
                assert.deepEqual(x.lock, r.lock);
            });
        });
        
        describe("with a basic timed lock", function(){
			var x = null;
			beforeEach(function(){
				x = new Exit(db, "east", room1, room2, {timeLock: {period: 60}});
			});
			
			it("is open to the user", function(){
				assert(x.isOpenTo(user));
			});
			
			it("is unlocked", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88];
				for(var i = 0; i < t.length; ++i)
					assert(x.isOpenAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
			
			it("is not open", function(){
				var t = [30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isOpenAt(t[i]), 
						format("expected to not be visible at %ds", t[i]));
			});
		});
        
        describe("with no cloak or lock", function(){
            var x = null;
            beforeEach(function(){
                x = new Exit(db, "north", "room1", "room2");
            });
            
            it("is a Thing", function(){
                assert(x instanceof Thing, "not a subclass of Thing");
            });
            
            it("persists fromRoomId", function(){
                assert.strictEqual(x.fromRoomId, "room1");
            });
            
            it("persists toRoomId", function(){
                assert.strictEqual(x.toRoomId, "room2");
            });
            
            it("generates a special ID", function(){
                assert.strictEqual(x.id, "exit-north-from-room1-to-room2");
            });
            
            it("uses base ID as description", function(){
                assert.strictEqual(x.description, "north");
            });
            
            it("creates reverse exit, too", function(){
                var rId = "exit-south-from-room2-to-room1";
                var y = db[rId];
                assert.strictEqual(x.reverseId, rId);
                assert(y, "reverse exit doesn't exist");
                assert.strictEqual(y.id, rId);
                assert.strictEqual(y.fromRoomId, "room2");
                assert.strictEqual(y.toRoomId, "room1");
            });
            
            it("makes room parent of exit", function(){
                assert(x.parentId);
                assert.strictEqual(room1, x.getParent());
            });
            
            it("makes exit child of room", function(){
                var y = room1.ofType(Exit)[0];
                assert.strictEqual(y, x);
            });
            
            it("makes reverse exit child of other room", function(){
                var rx = db[x.reverseId];
                var y = room2.ofType(Exit)[0];
                assert.strictEqual(y, rx);
            });
            
            it("makes reverse exit child of other room", function(){
                var rx = db[x.reverseId];
                var y = room2.ofType(Exit)[0];
                assert.strictEqual(y, rx);
            });
            
            it("is visible by default", function(){
                assert(x.isVisibleTo(user), "basic room isn't visible to basic user.");
            });
            
            it("is open by default", function(){
                assert(x.isOpenTo(user), "basic room isn't open to basic user.");        
            });
            
            it("is visible at any time", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88, 30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(x.isVisibleAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
            
            it("is open at any time", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88, 30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(x.isOpenAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
            
            it("describes naturally", function(){
                assert.equal(x.describe(user, 0), "north to room2");
            });
        });
    });
});
