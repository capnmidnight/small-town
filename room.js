var Thing = require("./thing.js");
var Exit = require("./exit.js");
var Item = require("./item.js");
var AIBody = require("./aibody.js");
var fs = require("fs");

// Room class
//  - db: a database of all things
//  - description: the description of the room, that will get
//          printed for the user when they "look".
function Room(db, id, description) {
    Thing.call(this, db, id, description);
}

Room.prototype = Object.create(Thing.prototype);
module.exports = Room;

var parsers = {
    none: function (line, options) {
        return parsers[line] ? line : "quit";
    },

    exits: function (line, options) {
        if (line.length === 0)
            return "none"
        else {
            options.exits.push(line);
            return "exits";
        }
    },

    items: function (line, options) {
        if (line.length === 0)
            return "none"
        else {
            options.items.push(line);
            return "items";
        }
    }
};

Room.parse = function (db, roomId, text) {
    text = text
        .replace(/\r/g, "");
    var lines = text
        .split("\n")
        .map(function (l) { return l.trim(); });
    var options = {
        items: [],
        exits: []
    };
    var state = "none";
    while (lines.length > 0 && state != "quit") {
        var oldState = state;
        var line = lines.shift();
        state = parsers[state](line, options);
        if (state === "quit")
            lines.unshift(line);
    }
    var description = lines.join("\r\n");
    var room = new Room(db, roomId, description);
    for(var i = 0; i < options.exits.length; ++i)
        var exit = Exit.parse(db, roomId, options.exits[i]);
    for (var i = 0; i < options.items.length; ++i)
        var item = Item.loadIntoRoom(db, roomId, options.items[i]);
    return room;
};
