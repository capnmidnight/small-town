var Message = require("./message.js");
var core = require("./core.js");
var serverState = require("./serverState.js");
var format = require("util").format;

// Body class
//  A person, notionally. Both PCs and NPCs are represented as
//  Bodys right now, but NPCs get their inputQ filled by a different
//  source from PCs.
//  - roomId: the name of the room in which the Body starts.
//  - hp: how much health the Body starts with.
//  - items (optional): an associative array of item IDs to counts,
//          representing the stuff in the character's pockets.
//  - equipment (optional): an associative array of item IDs to
//          counts, representing the stuff in use by the character.
var Body = function(roomId, hp, items, equipment, id, socket)
{
    this.roomId = roomId;
    this.hp = hp;
    this.items = {};
    for(var itemId in items)
        this.items[itemId] = items[itemId];

    this.equipment = {};
    for(var slot in equipment)
        this.equipment[slot] = equipment[slot];

    this.inputQ = ["look"];
    this.msgQ = [];
    this.id = id;
    this.socket = socket;
    this.quit = false;
    if(this.socket)
    {
        var body = this;
        this.socket.on("cmd", function(data)
        {
            body.inputQ.push(data);
        });
        this.socket.on("disconnect", function ()
        {
            console.log("user disconnected:", body.id);
            body.cmd_quit();
        });
    }
}

Body.prototype.copyTo = function(obj)
{
    Body.call(obj, this.roomId, this.hp, this.items, this.equipment, this.id);
}

Body.prototype.copy = function()
{
    return Object.create(this.__proto__);
}

Body.prototype.sysMsg = function (msg)
{
    this.informUser(new Message(msg, ""));
}

Body.prototype.doCommand = function ()
{
    var str = this.inputQ.shift();
    this.sysMsg(str);
    if (str.length > 0)
    {
        var tokens = str.split(" ");

        var cmd = tokens[0].toLowerCase();
        var params = tokens.slice(1);
        if (cmd == "say" || cmd == "yell")
            params = [params.join(" ")];
        else if (cmd == "tell" && params.length > 0)
            params = [params[0], params.slice(1).join(" ")];
        else
            for(var i = 0; i < params.length; ++i)
                params[i] = params[i].toLowerCase();

        var proc = this["cmd_" + cmd];
        if (!proc)
            this.sysMsg(format("I don't understand \"%s\".", cmd));
        else if (params.length < proc.length)
            this.sysMsg("not enough parameters");
        else if (params.length > proc.length)
            this.sysMsg("too many parameters");
        else if(this instanceof Body
            && this.hp <= 0
            && cmd != "quit")
            this.sysMsg("knocked out!");
        else
            proc.apply(this, params);
    }
}

Body.prototype.cmd_buy = function (targetId, itemId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("%s is not here to buy from.", targetId));
    else
        target.informUser(new Message(this.id, "buy", [itemId]));
}

Body.prototype.cmd_sell = function (targetId, itemId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("%s is not here to sell to.", targetId));
    else
        target.informUser(new Message(this.id, "sell", [itemId]));
}

Body.prototype.cmd_yell = function (msg)
{
    var m = new Message(this.id, "yell", [msg]);
    for(var userId in serverState.users)
        serverState.users[userId].informUser(m);
}

Body.prototype.cmd_say = function (msg)
{
    var m = new Message(this.id, "say", [msg]);
    var people = serverState.getPeopleIn(this.roomId);
    if(people)
        for(var userId in people)
            people[userId].informUser(m);
}

Body.prototype.cmd_tell = function (targetId, msg)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
    {
        this.sysMsg(format("%s is not here to tell anything to.", targetId));
    }
    else
    {
        target.informUser(new Message(this.id, "tell", [msg]));
    }
}

Body.prototype.informUser = function (msg)
{
    this.msgQ.push(msg);
}

Body.prototype.update = function ()
{
    if(this.socket && this.msgQ.length > 0)
    {
        var msg = this.msgQ.map(function(m){
            return format("%s %s %s\n\n", m.fromId, m.message, m.payload.join(" "));
        }).join("\n\n");

        this.msgQ = [];
        this.socket.emit("news", format("%s%s (%d) :>", msg, this.id, this.hp));
    }
}

Body.prototype.cmd_quit = function ()
{
    var m = new Message(this.id, ["quit"]);
    for(var userId in serverState.users)
        serverState.users[userId].informUser(m);
    this.quit = true;
}

Body.prototype.cmd_help = function ()
{
    var msg = "Available commands:\n\n";
    for (var cmd in this)
    {
        if(cmd.indexOf("cmd_") >= 0)
        {
            var func = this[cmd];
            var src = func.toString();
            var j = src.indexOf(")");
            src = src.substring(0, j);
            src = src.replace("function ", "");
            src = src.replace("(", " ");
            src = src.replace(", ", " ");
            src = src.replace(",", " ");
            cmd = cmd.replace("cmd_", "");
            msg += format("\t%s %s\n\n", cmd, src);
        }
    }
    this.sysMsg(msg);
}

function itemDescription(k, v)
{
    return format("\t%d %s - %s", v, k,
        (serverState.itemCatalogue[k] ? serverState.itemCatalogue[k].descrip : "(UNKNOWN)"));
}

function roomPeopleDescription(k, v)
{
    return format("\t%s%s", k, (serverState.users[k].hp > 0 ? "" : " (KNOCKED OUT)"));
}

function exitDescription(k, v)
{
    return format("\t%s to %s", k, v.roomId);
}

function greaterThan(a, b) { return a > b; }

Body.prototype.cmd_look = function ()
{
    var rm = serverState.rooms[this.roomId];
    if (!rm)
        this.sysMsg("What have you done!?");
    else
    {
        var items = core.where(rm.items, core.value, greaterThan, 0);
        var people = core.where(
            serverState.getPeopleIn(this.roomId),
            core.key,
            core.notEqual,
            this.id);
        var exits = core.where(
            rm.exits,
            core.value,
            core.notEqual, null);
        this.sysMsg(format("ROOM: %s\n\nITEMS:\n\n%s\n\nPEOPLE:\n\n%s\n\nEXITS:\n\n%s\n\n<hr>",
            rm.descrip,
            core.formatHash(itemDescription, items),
            core.formatHash(roomPeopleDescription, people),
            core.formatHash(exitDescription, exits)));
    }
}

Body.prototype.move = function (dir)
{
    var rm = serverState.rooms[this.roomId];
    var exit = rm.exits[dir];
    var exitRoom = exit && serverState.rooms[exit.roomId];
    if (!exit
        || !exitRoom
        || exit.key
            && !this.items[exit.key])
        this.sysMsg(format("You can't go %s. %s.", dir, ((exit && exit.key) ? exit.lockMsg : "")));
    else
    {
        var people = serverState.getPeopleIn(this.roomId);
        var m = new Message(this.id, "left");
        for(var userId in people)
            people[userId].informUser(m);
        this.roomId = exit.roomId;
        people = serverState.getPeopleIn(this.roomId);
        m = new Message(this.id, "entered");
        for(var userId in people)
            people[userId].informUser(m);
        this.cmd_look();
    }
}

Body.prototype.cmd_north = function () { this.move("north"); }
Body.prototype.cmd_east = function () { this.move("east"); }
Body.prototype.cmd_south = function () { this.move("south"); }
Body.prototype.cmd_west = function () { this.move("west"); }
Body.prototype.cmd_leave = function () { this.move("leave"); }
Body.prototype.cmd_up = function () { this.move("up"); }
Body.prototype.cmd_down = function () { this.move("down"); }
Body.prototype.cmd_enter = function () { this.move("enter"); }
Body.prototype.cmd_exit = function () { this.move("exit"); }

Body.prototype.cmd_take = function (itemId)
{
    var rm = serverState.rooms[this.roomId];
    var items = rm.items;
    if (itemId == "all")
    {
        for (itemId in items)
        {
            var people = serverState.getPeopleIn(this.roomId);
            var m = new Message(this.id, "take", [itemId]);
            for(var userId in people)
                people[userId].informUser(m);
            this.moveItem(itemId, items, this.items, "picked up", "here", items[itemId]);
        }
    }
    else
    {
        var people = serverState.getPeopleIn(this.roomId);
        var m = new Message(this.id, "take", [itemId]);
        for(var userId in people)
            people[userId].informUser(m);
        this.moveItem(itemId, items, this.items, "picked up", "here");
    }
}

Body.prototype.cmd_drop = function (itemId)
{
    var rm = serverState.rooms[this.roomId];
    this.moveItem(itemId, this.items, rm.items, "dropped", "in your inventory");
    var people = serverState.getPeopleIn(this.roomId);
    var m = new Message(this.id, "drop", [itemId]);
    for(var userId in people)
        people[userId].informUser(m);
}

Body.prototype.moveItem = function (itm, from, to, actName, locName, amt)
{
    if (core.transfer(itm, from, to, amt))
        this.sysMsg(format("You %s the %s.", actName, itm));
    else
        this.sysMsg(format("There is no %s %s", itm, locName));
}

Body.prototype.cmd_give = function (targetId, itemId)
{
    var rm = serverState.rooms[this.roomId];
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("%s is not here", targetId));
    else
    {
        this.moveItem(itemId, this.items, target.items, format("gave to %s", targetId), "in your inventory");
        var m = new Message(this.id, "give", [targetId, itemId]);
        for(var userId in people)
            people[userId].informUser(m);
    }
}

Body.prototype.cmd_make = function (recipeId)
{
    var recipe = serverState.recipes[recipeId];
    if(!recipe)
        this.sysMsg(format("%s isn't a recipe.", recipeId));
    if (!core.hashSatisfies(this.items, recipe.tools))
        this.sysMsg("You don't have all of the tools.");
    else if (!core.hashSatisfies(this.items, recipe.ingredients))
        this.sysMsg("You don't have all of the ingredients");
    else
    {
        for (var itemId in recipe.ingredients)
        {
            core.dec(this.items, itemId, recipe.ingredients[itemId]);
            this.sysMsg(format("%d %s(s) removed from inventory.", recipe.ingredients[itemId], itemId));
        }

        for (var itemId in recipe.results)
        {
            core.inc(this.items, itemId, recipe.results[itemId]);
            this.sysMsg(format("You created %d %s(s).", recipe.results[itemId], itemId));
        }
        var people = serverState.getPeopleIn(this.roomId);
        var m = new Message(this.id, "make", [recipeId]);
        for(var userId in people)
            people[userId].informUser(m);
    }
}

function equipDescription(k, v)
{
    return format("\t(%s) %s - %s", k, v,
        (serverState.itemCatalogue[v] ? serverState.itemCatalogue[v].descrip : "(UNKNOWN)"));
}

Body.prototype.cmd_inv = function ()
{
    this.sysMsg(format("Equipped:\n\n%s\n\nUnequipped:\n\n%s\n\n<hr>",
        core.formatHash(equipDescription, this.equipment),
        core.formatHash(itemDescription, this.items)));
}

Body.prototype.cmd_drink = function(itemId)
{
    var item = serverState.itemCatalogue[itemId];
    if(!this.items[itemId])
        this.sysMsg(format("You don't have a %s to drink.", itemId));
    else if(item.equipType != "food")
        this.sysMsg(format("You can't drink a %s, for it is a %s.", itemId, item.equipType));
    else
    {
        core.dec(this.items, itemId);
        this.hp += item.strength;
        this.sysMsg(format("Health restored by %d points.", item.strength));
    }
}

Body.prototype.cmd_equip = function (itemId)
{
    var itmCount = this.items[itemId];
    var itm = serverState.itemCatalogue[itemId];
    if (itmCount === undefined || itmCount <= 0)
        this.sysMsg(format("You don't have the %s.", itemId));
    else if (serverState.equipTypes.indexOf(itm.equipType) < 0)
        this.sysMsg(format("You can't equip the %s.", itemId));
    else
    {
        var current = this.equipment[itm.equipType];
        if (current)
            core.inc(this.items, current);
        this.equipment[itm.equipType] = itemId;
        core.dec(this.items, itemId);
        this.sysMsg(format("You equiped the %s as a %s.", itemId, itm.equipType));
    }
}

Body.prototype.cmd_remove = function (itemId)
{
    for (var slot in this.equipment)
    {
        if (this.equipment[slot] == itemId)
        {
            core.inc(this.items, itemId);
            delete this.equipment[slot];
            this.sysMsg(format("You removed the %s as your %s.", itemId, slot));
            return;
        }
    }
    this.sysMsg(format("There is no %s to remove.", itemId));
}

Body.prototype.cmd_who = function ()
{
    var msg = "People online:\n\n";
    msg += core.formatHash(function (k, v) { return format("\t%s - %s", k, v.roomId); }, serverState.users);
    this.sysMsg(msg);
}


Body.prototype.cmd_attack = function (targetId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("%s is not here to attack.", targetId));
    else
    {
        var atk = 1;
        var wpnId = this.equipment["tool"];
        if (wpnId)
        {
            var wpn = serverState.itemCatalogue[wpnId];
            if (wpn)
                atk += wpn.strength;
        }
        else
            wpnId = "bare fists";

        var def = 0;
        for(var i = 0; i < serverState.armorTypes.length; ++i)
        {
            var armId = target.equipment[serverState.armorTypes[i]];
            if(armId)
            {
                var arm = serverState.itemCatalogue[armId];
                if(arm)
                    def += arm.strength;
            }
        }
        atk = Math.max(atk - def, 0);
        target.hp -= atk;
        var m = new Message(this.id, "attack", [targetId]);
        for(var userId in people)
            people[userId].informUser(m);
        target.informUser(new Message(this.id, "damage", [atk]));
        this.sysMsg(format("You attacked %s with %s for %d damage.", targetId, wpnId, atk));
    }
}

Body.prototype.cmd_loot = function(targetId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if(!target)
        this.sysMsg(format("%s is not here to loot.", targetId));
    else if(target.hp > 0)
        this.sysMsg(format("%s knocks your hand away from his pockets.", targetId));
    else
    {
        for(var slot in target.equipment)
            target.cmd_remove(target.equipment[slot]);

        for(var itemId in target.items)
            this.moveItem(itemId, target.items, this.items, "looted", "from " + targetId, target.items[itemId]);
    }
}

module.exports = Body;


