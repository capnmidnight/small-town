var Exit = require("../exit.js");
var Thing = require("../thing.js");
var Room = require("../room.js");
var Body = require("../body.js");
var Item = require("../item.js");
var assert = require("assert");

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
                new Exit(db, "north", "room1", "room2", "hat");
            });            
        });
        
        it("doesn't accept undefined-item array as cloak", function(){
            assert.throws(function(){
                new Exit(db, "north", "room1", "room2", ["hat", "cat"]);
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
                new Exit(db, "north", room1, room2, "key");
            });
        });
        
        it("allows id array for cloak", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, room2, ["key", "jewel"]);
            });
        });
        
        it("allows ref for cloak", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, room2, item1);
            });
        });
        
        it("allows ref array for cloak", function(){
            assert.doesNotThrow(function(){
                new Exit(db, "north", room1, room2, [item1, item2]);
            });
        });
    });
    
    describe("uni-directional exits", function(){
        var x = null;
        
        beforeEach(function(){
            x = new Exit(db, "south", "room1", "room2", null, null, null, true);
        });
    
        it("doesn't set reverseId when asked", function(){
            assert.ok(!x.reverseId);
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
        
        describe("when the exit has one item for the cloak", function(){
            var x = null;
            beforeEach(function(){
                x = new Exit(db, "south", "room2", "room1", ["key"]);
            });
        
            it("isn't visible if the cloak is set", function(){
                assert.ok(!x.visibleTo(user));
            });
            
            it("becomes visible if user has item", function(){
                user.items.key = 1;
                assert.ok(x.visibleTo(user));
            });
        });
        
        describe("when exit has two items for the cloak", function(){
            var x = null;
            beforeEach(function(){
                x = new Exit(db, "south", "room2", "room1", ["key", "jewel"]);
            });
        
            it("isn't visible if user only has some of the cloak items", function(){
                user.items.key = 1;
                assert.ok(!x.visibleTo(user));
            });
            
            it("becomes visible if user has all of the cloak items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                assert.ok(x.visibleTo(user));
            });
            
            it("still visible if user has more than one of one of the items", function(){
                user.items.key = 23;
                user.items.jewel = 1;
                assert.ok(x.visibleTo(user));
            });
            
            it("still visible if user has more than one of each items", function(){
                user.items.key = 23;
                user.items.jewel = 17;
                assert.ok(x.visibleTo(user));
            });
            
            it("still visible if user has extra items", function(){
                user.items.key = 1;
                user.items.jewel = 1;
                user.items.hat = 1;
                assert.ok(x.visibleTo(user));
            });
        });
        
        describe("with no cloak", function(){
            var x = null;
            beforeEach(function(){
                x = new Exit(db, "north", "room1", "room2");
            });
            it("is a Thing", function(){
                assert.ok(x instanceof Thing, "not a subclass of Thing");
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
                assert.ok(y, "reverse exit doesn't exist");
                assert.strictEqual(y.id, rId);
                assert.strictEqual(y.fromRoomId, "room2");
                assert.strictEqual(y.toRoomId, "room1");
            });
            
            it("makes room parent of exit", function(){
                assert.ok(x.parentId);
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
                assert.ok(x.visibleTo(user), "basic room isn't visible to basic user.");        
            });
        });
    });
});
