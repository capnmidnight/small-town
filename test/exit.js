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
       
		it("doesn't allow negative timeCloak period", function(){
			assert.throws(function(){
				new Exit(db, "north", room1, room2, {timeCloak: {period: -10}});
			});
		});
       
		it("doesn't allow negative timeCloak width", function(){
			assert.throws(function(){
				new Exit(db, "north", room1, room2, {timeCloak: {period: 60, width:-0.1}});
			});
		});
		
		it("doesn't allow greater than 1 timeCloak width", function(){
			assert.throws(function(){
				new Exit(db, "north", room1, room2, {timeCloak: {period: 60, width:1.1}});
			});
		});
       
		it("doesn't allow negative timeLock period", function(){
			assert.throws(function(){
				new Exit(db, "north", room1, room2, {timeLock: {period: -10}});
			});
		});
       
		it("doesn't allow negative timeLock width", function(){
			assert.throws(function(){
				new Exit(db, "north", room1, room2, {timeLock: {period: 60, width:-0.1}});
			});
		});
		
		it("doesn't allow greater than 1 timeLock width", function(){
			assert.throws(function(){
				new Exit(db, "north", room1, room2, {timeLock: {period: 60, width:1.1}});
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
                assert(x.isCloakedTo(user));
            });
            
            it("is locked if not visible", function(){
                assert(x.isLockedTo(user));
            });
            
            it("becomes visible if user has item", function(){
                user.items.key = 1;
                assert(!x.isCloakedTo(user));
            });
            
            it("is visible even if the item is equipped", function(){
                user.equipment.key = 1;
                assert(!x.isCloakedTo(user));
            });
            
            it("is unlocked if visible", function(){
                user.items.key = 1;
                assert(!x.isLockedTo(user));
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
                assert(x.isCloakedTo(user));
            });
            
            it("becomes visible if user has all of the cloak items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                assert(!x.isCloakedTo(user));
            });
            
            it("still visible if user has some of the key equipped", function(){
                user.items.key = 1;
                user.equipment.jewel = 1;
                assert(!x.isCloakedTo(user));
            });
            
            it("still visible if user has all of the key equipped", function(){
                user.equipment.key = 1;
                user.equipment.jewel = 1;
                assert(!x.isCloakedTo(user));
            });
            
            it("still visible if user has more than one of one of the items", function(){
                user.items.key = 23;
                user.items.jewel = 1;
                assert(!x.isCloakedTo(user));
            });
            
            it("still visible if user has more than one of each items", function(){
                user.items.key = 23;
                user.items.jewel = 17;
                assert(!x.isCloakedTo(user));
            });
            
            it("still visible if user has extra items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                user.items.hat = 1;
                assert(!x.isCloakedTo(user));
            });
            
            it("shares cloak with reverse direction", function(){
                assert.deepEqual(x.cloak, r.cloak);
            });
            
            it("is visible at any time", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88, 30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isCloakedAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
            
            it("is open at any time", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88, 30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isLockedAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
        });
        
        describe("with a basic timed cloak", function(){
			var x = null;
			beforeEach(function(){
				x = new Exit(db, "east", room1, room2, {timeCloak: {period: 60}});
			});
			
			it("is visible to the user", function(){
				assert(!x.isCloakedTo(user));
			});
			
			it("is visible", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88];
				for(var i = 0; i < t.length; ++i)
					assert(x.isCloakedAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
			
			it("is not visible", function(){
				var t = [30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isCloakedAt(t[i]), 
						format("expected to not be visible at %ds", t[i]));
			});
		});
        
        describe("with a shifted timed cloak", function(){
			var x = null;
			beforeEach(function(){
				x = new Exit(db, "east", room1, room2, {timeCloak: {period: 60, shift: 12}});
			});
			
			it("is visible to the user", function(){
				assert(!x.isCloakedTo(user));
			});
			
			it("is visible", function(){
				var t = [12, 22, 32, 41, 72, 73, 82, 100];
				for(var i = 0; i < t.length; ++i)
					assert(x.isCloakedAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
			
			it("is not visible", function(){
				var t = [0, 11, 42, 47, 57, 71, 102, 104, 112, 131];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isCloakedAt(t[i]), 
						format("expected to not be visible at %ds", t[i]));
			});
		});
        
        describe("with a wider cloak", function(){
			var x = null;
			beforeEach(function(){
				x = new Exit(db, "east", room1, room2, {timeCloak: {period: 60, width: 0.75}});
			});
			
			it("is visible to the user", function(){
				assert(!x.isCloakedTo(user));
			});
			
			it("has the expected mid value", function(){
				assert.equal(x.timeCloak.mid, 45);
			});
			
			it("is visible", function(){
				var t = [0, 15, 30, 44, 60, 75, 90, 104];
				for(var i = 0; i < t.length; ++i)
					assert(x.isCloakedAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
			
			it("is not visible", function(){
				var t = [45, 59, 105, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isCloakedAt(t[i]), 
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
                var x2 = new Exit(db, "west", room1, room2, {lock: item1, lockMessage: "lockity mclocked"});
                assert.equal(x2.lockMessage, "lockity mclocked");
            });
        
            it("is locked if the lock is set", function(){
                assert(x.isLockedTo(user));
            });
            
            it("becomes unlocked if user has item", function(){
                user.items.key = 1;
                assert(!x.isLockedTo(user));
            });
            
            it("still unlocked if user has item equipped", function(){
                user.equipment.key = 1;
                assert(!x.isLockedTo(user));
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
                assert(x.isLockedTo(user));
            });
            
            it("becomes unlocked if user has all of the cloak items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                assert(!x.isLockedTo(user));
            });
            
            it("still unlocked if user has more than one of the items", function(){
                user.items.key = 23;
                user.items.jewel = 1;
                assert(!x.isLockedTo(user));
            });
            
            it("still unlocked if user has one of the items equipped", function(){
                user.equipment.key = 1;
                user.items.jewel = 1;
                assert(!x.isLockedTo(user));
            });
            
            it("still unlocked if user has all of the items equipped", function(){
                user.equipment.key = 1;
                user.equipment.jewel = 1;
                assert(!x.isLockedTo(user));
            });
            
            it("still unlocked if user has more than one of each items", function(){
                user.items.key = 23;
                user.items.jewel = 17;
                assert(!x.isLockedTo(user));
            });
            
            it("still unlocked if user has extra items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                user.items.hat = 1;
                assert(!x.isLockedTo(user));
            });
            
            it("displays \"(LOCKED)\"", function(){
				assert(!x.isCloaked(user, 0), "exit is cloaked!");
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
                assert(!x.isCloaked(user, 0), "exit is cloaked!");
                assert(!x.isLocked(user, 0), "exit is locked!");
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
				assert(!x.isLockedTo(user));
			});
			
			it("is unlocked", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88];
				for(var i = 0; i < t.length; ++i)
					assert(x.isLockedAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
			
			it("is not open", function(){
				var t = [30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isLockedAt(t[i]), 
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
                assert(!x.isCloakedTo(user), "basic room isn't visible to basic user.");
            });
            
            it("is open by default", function(){
                assert(!x.isLockedTo(user), "basic room isn't open to basic user.");        
            });
            
            it("is visible at any time", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88, 30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isCloakedAt(t[i]), 
						format("expected to be visible at %ds", t[i]));
			});
            
            it("is open at any time", function(){
				var t = [0, 10, 20, 29, 60, 61, 70, 88, 30, 35, 45, 59, 90, 92, 100, 119];
				for(var i = 0; i < t.length; ++i)
					assert(!x.isLockedAt(t[i]), 
						format("expected to be open at %ds", t[i]));
			});
            
            it("describes naturally", function(){
                assert.equal(x.describe(user, 0), "north to room2");
            });
        });
    });

	describe("parsed from text", function(){
		function basicTest(x){
			assert(x, "object not created");
			assert(x instanceof Exit, "object wasn't an exit");
			assert.equal(x.id, "exit-north-from-room1-to-room2", "description is incorrect");
			assert.strictEqual(x.getParent(), room1, "exit wasn't made child of room");
		}
		it("can do very basic exits", function(){
			var x = Exit.parse(db, room1, "north to room2");
			basicTest(x);
			assert(db["exit-south-from-room2-to-room1"], "reverse exit wasn't made");
		});
		
		it("can do unidirectional exits", function(){
			var x = Exit.parse(db, room1, "-north to room2");
			basicTest(x);
			assert(!db["exit-south-from-room2-to-room1"], "reverse exit was made");
		});
		
		it("can do basic cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked with jewel");
			basicTest(x);
			assert.equal(x.cloak.length, 1, "cloak not set");
			assert.equal(x.cloak[0], "jewel", "cloak not set");
		});
		
		it("can do two-item cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked with jewel, key");
			basicTest(x);
			assert.equal(x.cloak.length, 2, "cloak not set");
			assert.equal(x.cloak[0], "jewel", "cloak not set");
			assert.equal(x.cloak[1], "key", "cloak not set");
		});
		
		it("can do base time cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked when 60");
			basicTest(x);
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.shift, 0, "timeCloak shift not set");
			assert.equal(x.timeCloak.mid, 30, "timeCloak mid not set");
		});
		
		it("can do wide cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked when 60, 0.75");
			basicTest(x);
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 45, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 0, "timeCloak shift not set");
		});
		
		it("can do shift time cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked when 60, 0.25, 100");
			basicTest(x);
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
		
		it("can do basic item, then time cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked with key when 60, 0.25, 100");
			basicTest(x);
			assert.equal(x.cloak.length, 1, "cloak not set");
			assert.equal(x.cloak[0], "key", "cloak not set");
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
		
		it("can do complex item, then time cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked with key, jewel when 60, 0.25, 100");
			basicTest(x);
			assert.equal(x.cloak.length, 2, "cloak not set");
			assert.equal(x.cloak[0], "key", "cloak not set");
			assert.equal(x.cloak[1], "jewel", "cloak not set");
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
		
		it("can do time, then basic item cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked when 60, 0.25, 100 with key");
			basicTest(x);
			assert.equal(x.cloak.length, 1, "cloak not set");
			assert.equal(x.cloak[0], "key", "cloak not set");
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
		
		it("can do time, then complex item cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked when 60, 0.25, 100 with key, jewel");
			basicTest(x);
			assert.equal(x.cloak.length, 2, "cloak not set");
			assert.equal(x.cloak[0], "key", "cloak not set");
			assert.equal(x.cloak[1], "jewel", "cloak not set");
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
		
		it("can do basic lock", function(){
			var x = Exit.parse(db, room1, "north to room2 locked with jewel");
			basicTest(x);
			assert.equal(x.lock.length, 1, "cloak not set");
			assert.equal(x.lock[0], "jewel", "cloak not set");
		});
		
		it("can do two-item lock", function(){
			var x = Exit.parse(db, room1, "north to room2 locked with jewel, key");
			basicTest(x);
			assert.equal(x.lock.length, 2, "lock not set");
			assert.equal(x.lock[0], "jewel", "lock not set");
			assert.equal(x.lock[1], "key", "lock not set");
		});
		
		it("can do two-item lock with message", function(){
			var x = Exit.parse(db, room1, "north to room2 locked with jewel, key \"don't go\"");
			basicTest(x);
			assert.equal(x.lock.length, 2, "lock not set");
			assert.equal(x.lock[0], "jewel", "lock not set");
			assert.equal(x.lock[1], "key", "lock not set");
			assert.equal(x.lockMessage, "don't go", "lock message not set");
		});
		
		it("can do lock message before key", function(){
			var x = Exit.parse(db, room1, "north to room2 locked \"don't go\" with jewel, key");
			basicTest(x);
			assert.equal(x.lock.length, 2, "lock not set");
			assert.equal(x.lock[0], "jewel", "lock not set");
			assert.equal(x.lock[1], "key", "lock not set");
			assert.equal(x.lockMessage, "don't go", "lock message not set");
		});
		
		it("can do base time lock", function(){
			var x = Exit.parse(db, room1, "north to room2 locked when 60");
			basicTest(x);
			assert.equal(x.timeLock.period, 60, "timeLock period not set");
			assert.equal(x.timeLock.shift, 0, "timeLock shift not set");
			assert.equal(x.timeLock.mid, 30, "timeLock mid not set");
		});
		
		it("can do wide lock", function(){
			var x = Exit.parse(db, room1, "north to room2 locked when 60, 0.75");
			basicTest(x);
			assert.equal(x.timeLock.period, 60, "timeLock period not set");
			assert.equal(x.timeLock.mid, 45, "timeLock mid not set: " + x.timeLock.mid);
			assert.equal(x.timeLock.shift, 0, "timeLock shift not set");
		});
		
		it("can do shift time lock", function(){
			var x = Exit.parse(db, room1, "north to room2 locked when 60, 0.25, 100");
			basicTest(x);
			assert.equal(x.timeLock.period, 60, "timeLock period not set");
			assert.equal(x.timeLock.mid, 15, "timeLock mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeLock.shift, 100, "timeLock shift not set");
		});
		
		it("can do basic item, then time cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked with key when 60, 0.25, 100");
			basicTest(x);
			assert.equal(x.cloak.length, 1, "cloak not set");
			assert.equal(x.cloak[0], "key", "cloak not set");
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
		
		it("can do complex item, then time cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked with key, jewel when 60, 0.25, 100");
			basicTest(x);
			assert.equal(x.cloak.length, 2, "cloak not set");
			assert.equal(x.cloak[0], "key", "cloak not set");
			assert.equal(x.cloak[1], "jewel", "cloak not set");
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
		
		it("can do time, then basic item cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked when 60, 0.25, 100 with key");
			basicTest(x);
			assert.equal(x.cloak.length, 1, "cloak not set");
			assert.equal(x.cloak[0], "key", "cloak not set");
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
		
		it("can do time, then complex item cloak", function(){
			var x = Exit.parse(db, room1, "north to room2 cloaked when 60, 0.25, 100 with key, jewel");
			basicTest(x);
			assert.equal(x.cloak.length, 2, "cloak not set");
			assert.equal(x.cloak[0], "key", "cloak not set");
			assert.equal(x.cloak[1], "jewel", "cloak not set");
			assert.equal(x.timeCloak.period, 60, "timeCloak period not set");
			assert.equal(x.timeCloak.mid, 15, "timeCloak mid not set: " + x.timeCloak.mid);
			assert.equal(x.timeCloak.shift, 100, "timeCloak shift not set");
		});
	});
});
