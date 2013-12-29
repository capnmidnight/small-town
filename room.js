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
        return something(line, options, "exits");
    },

    items: function (line, options) {
        return something(line, options, "items");
    },

    npcs: function (line, options) {
        return something(line, options, "npcs");
    }
};

function something(line, options, name) {
    if (line.length === 0)
        return "none";
    else {
        if (!options[name])
            options[name] = [];
        options[name].push(line);
        return name;
    }
}

Room.parse = function (db, roomId, text) {
    text = text
        .replace(/\r/g, "");
    var lines = text
        .split("\n")
        .map(function (l) { return l.trim(); });
    var options = {
        items: [],
        exits: [],
        npcs: []
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
    new Room(db, roomId, description);
    return options;
};

Room.loadAll = function (db, roomIds) {
    var opts = {};
    var rooms = [];
    for (var i = 0; i < roomIds.length; ++i) {
        var roomId = roomIds[i];
        opts[roomId] = Room.parse(db, roomId, fs.readFileSync("rooms/" + roomId + ".room", { encoding: "utf8" }));
        rooms.push(db[roomId]);
    }
    for (var roomId in opts) {
        var room = db[roomId];
        var options = opts[roomId];
        for (var i = 0; i < options.exits.length; ++i)
            var exit = Exit.parse(db, roomId, options.exits[i]);

        for (var i = 0; i < options.items.length; ++i)
            var item = Item.loadIntoRoom(db, roomId, options.items[i]);

        room.items = options.items.map(function (i) {
            var parts = i.split(' ');
            return { itemId: parts[0], count: parts[1] * 1 };
        });
        room.npcs = options.npcs;
    }
    return rooms;
};

Room.loadFromDir = function (db, dirName) {
    Room.loadAll(db, fs.readdirSync(dirName)
        .filter(function (f) { return f.match(/\.room$/); })
        .map(function (f) { return f.replace(".room", ""); }));
};
