var Item = require("../item.js");
var assert = require("assert");

describe("Item", function () {
    var db;
    beforeEach(function () {
        db = {};
    });

    it("can parse a basic item", function () {
        Item.parse(db, "none", "key a basic key");
        var item = db["key"];
        assert(item, "object wasn't created.")
        assert.equal(item.id, "key");
        assert.equal(item.strength, 0);
        assert.equal(item.equipType, "none")
        assert.equal(item.description, "a basic key");
    });

    it("can parse a items with quote in descriptions", function () {
        Item.parse(db, "none", "key a \"basic\" key");
        var item = db["key"];
        assert(item, "object wasn't created.")
        assert.equal(item.id, "key");
        assert.equal(item.strength, 0);
        assert.equal(item.equipType, "none")
        assert.equal(item.description, "a \"basic\" key");
    });

    it("can parse an item with strength", function () {
        Item.parse(db, "none", "jewel 20 it sparkles in the light");
        var item = db["jewel"];
        assert(item, "object wasn't created.")
        assert.equal(item.id, "jewel");
        assert.equal(item.strength, 20);
        assert.equal(item.equipType, "none")
        assert.equal(item.description, "it sparkles in the light");
    });

    it("can process a few items of different types", function () {
        Item.process(db, "none\n" +
            "   key a basic key\n" +
            "   jewel 20 it sparkles in the light\n\n" +
            "head\n" +
            "   hat 1 a dashing topper\n" +
            "   crab 2 chitin is tough");

        var key = db["key"];
        var jewel = db["jewel"];
        var hat = db["hat"];
        var crab = db["crab"];

        assert(key);
        assert.equal(key.strength, 0);
        assert.equal(key.id, "key");
        assert.equal(key.equipType, "none");
        assert.equal(key.description, "a basic key");

        assert(jewel);
        assert.equal(jewel.strength, 20);
        assert.equal(jewel.id, "jewel");
        assert.equal(jewel.equipType, "none");
        assert.equal(jewel.description, "it sparkles in the light");

        assert(hat);
        assert.equal(hat.strength, 1);
        assert.equal(hat.id, "hat");
        assert.equal(hat.equipType, "head");
        assert.equal(hat.description, "a dashing topper");

        assert(crab);
        assert.equal(crab.strength, 2);
        assert.equal(crab.id, "crab");
        assert.equal(crab.equipType, "head");
        assert.equal(crab.description, "chitin is tough");
    });

    it("can load the entire catalogue", function () {
        assert.doesNotThrow(function () {
            Item.load(db, "itemCatalogue.txt");
        });
    });
});
