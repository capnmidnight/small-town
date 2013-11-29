var Message = require("./message.js");
var core = require("./core.js");
var serverState = require("./serverState.js");

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
var Body = function(roomId, hp, items, equipment)
{
    this.roomId = roomId;
    this.hp = hp;
    this.items = items ? items : {};
    this.equipment = equipment ? equipment : {};
    this.msgQ = [];
    this.inputQ = [];
    this.id = null;
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

        var cmd = tokens[0];
        var params = tokens.slice(1);
        if (cmd == "say" || cmd == "yell")
            params = [params.join(" ")];
        else if (cmd == "tell" && params.length > 0)
            params = [params[0], params.slice(1).join(" ")];

        var proc = this["cmd_" + cmd];
        if (!proc)
            this.sysMsg(core.format("I don't understand \"{0}\".", cmd));
        else if (params.length < proc.length)
            this.sysMsg("not enough parameters");
        else if (params.length > proc.length)
            this.sysMsg("too many parameters");
        else if(this.hp <= 0 && cmd != "quit")
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
        this.sysMsg(core.format("{0} is not here to buy from.", targetId));
    else
        target.informUser(new Message(this.id, "buy", [itemId]));
}

Body.prototype.cmd_sell = function (targetId, itemId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(core.format("{0} is not here to sell to.", targetId));
    else
        target.informUser(new Message(this.id, "sell", [itemId]));
}

Body.prototype.cmd_yell = function (msg)
{
    var m = new Message(this.id, "yell", [msg]);
    for(var userId in serverState.everyone)
        serverState.everyone[userId].inforuser(m);
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
        this.sysMsg(core.format("{0} is not here to tell anything to.", targetId));
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
            return core.format("{0} {1} {2}\n\n", m.fromId, m.message, m.payload.join(" "));
        }).join("\n\n");

        this.msgQ = [];
        this.socket.emit("news", core.format("{0}{1} ({2}) :>", msg, this.id, this.hp));
    }
}

Body.prototype.cmd_quit = function ()
{
    var m = new Message(this.id, ["quit"]);
    for(var userId in serverState.everyone)
        serverState.everyone[userId].informUser(m);
    if (this.id == "player")
        done = true;
    delete serverState.everyone[this.id];
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
            msg += core.format("*    {0} {1}\n\n", cmd, src);
        }
    }
    this.sysMsg(msg);
}

function itemDescription(k, v)
{
    return core.format("*    {1} {0} - {2}", k, v,
        (serverState.everything[k] ? serverState.everything[k].descrip : "(UNKNOWN)"));
}

function roomPeopleDescription(k, v)
{
    return format("*    {0}{1}", k, (serverState.everyone[k].hp > 0 ? "" : " (KNOCKED OUT)"));
}

function exitDescription(k, v)
{
    return core.format("*    {0} to {1}", k, v);
}
function greaterThan(a, b) { return a > b; }
Body.prototype.cmd_look = function ()
{
    var rm = serverState.everywhere[this.roomId];
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
        this.sysMsg(core.format("ROOM: {0}\n\nITEMS:\n\n{1}\n\nPEOPLE:\n\n{2}\n\nEXITS:\n\n{3}\n\n"
            + "***",
            rm.descrip,
            core.formatHash(itemDescription, items),
            core.formatHash(roomPeopleDescription, people),
            core.formatHash(exitDescription, exits)));
    }
}

Body.prototype.move = function (dir)
{
    var rm = serverState.everywhere[this.roomId];
    var exit = rm.exits[dir];
    var exitRoom = exit && serverState.everwhere[exit.roomId];
    if (!exit
        || !exitRoom
        || exit.key
            && !this.items[exit.key])
        this.sysMsg(core.format("You can't go {0}. {1}.", dir, ((exit && exit.key) ? exit.lockMsg : "")));
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
    var rm = serverState.everywhere[this.roomId];

    if (itemId == "all")
    {
        for (var key in rm.items)
        {
            var people = serverState.getPeopleIn(this.roomId);
            var m = new Message(this.id, "take", [key]);
            for(var userId in people)
                people[userId].informUser(m);
            this.moveItem(key, rm.items, this.items, "picked up", "here", rm.items[key]);
        }
    }
    else
    {
        var people = serverState.getPeopleIn(this.roomId);
        var m = new Message(this.id, "take", [itemId]);
        for(var userId in people)
            people[userId].informUser(m);
        this.moveItem(itemId, rm.items, this.items, "picked up", "here");
    }
}

Body.prototype.cmd_drop = function (itemId)
{
    var rm = serverState.everywhere[this.roomId];
    this.moveItem(itemId, this.items, rm.items, "dropped", "in your inventory");
    var people = serverState.getPeopleIn(this.roomId);
    var m = new Message(this.id, "drop", [itemId]);
    for(var userId in people)
        people[userId].informUser(m);
}

Body.prototype.moveItem = function (itm, from, to, actName, locName, amt)
{
    if (transfer(itm, from, to, amt))
        this.sysMsg(core.format("You {0} the {1}.", actName, itm));
    else
        this.sysMsg(core.format("There is no {0} {1}", itm, locName));
}

Body.prototype.cmd_give = function (targetId, itemId)
{
    var rm = serverState.everywhere[this.roomId];
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(core.format("{0} is not here", targetId));
    else
    {
        this.moveItem(itemId, this.items, target.items, core.format("gave to {0}", targetId), "in your inventory");
        var m = new Message(this.id, "give", [targetId, itemId]);
        for(var userId in people)
            people[userId].informUser(m);
    }
}

Body.prototype.cmd_make = function (recipeId)
{
    var recipe = recipes[recipeId];
    if(!recipe)
        this.sysMsg(core.format("{0} isn't a recipe.", recipeId));
    if (!hashSatisfies(this.items, recipe.tools))
        this.sysMsg("You don't have all of the tools.");
    else if (!hashSatisfies(this.items, recipe.ingredients))
        this.sysMsg("You don't have all of the ingredients");
    else
    {
        for (var key in recipe.ingredients)
        {
            dec(this.items, key, recipe.ingredients[key]);
            this.sysMsg(core.format("{0} {1}(s) removed from inventory.", recipe.ingredients[key], key));
        }

        for (var key in recipe.results)
        {
            inc(this.items, key, recipe.results[key]);
            this.sysMsg(core.format("You created {0} {1}(s).", recipe.results[key], key));
        }
        var people = serverState.getPeopleIn(this.roomId);
        var m = new Message(this.id, "make", [recipeId]);
        for(var userId in people)
            people[userId].informUser(m);
    }
}

function equipDescription(k, v)
{
    return core.format("*    ({0}) {1} - {2}", k, v,
        (serverState.everything[v] ? serverState.everything[v].descrip : "(UNKNOWN)"));
}

Body.prototype.cmd_inv = function ()
{
    this.sysMsg(core.format("Equipped:\n\n{0}\n\nUnequipped:\n\n{1}\n\n***",
        core.formatHash(equipDescription, this.equipment),
        core.formatHash(itemDescription, this.items)));
}

Body.prototype.cmd_drink = function(itemId)
{
    var item = serverState.everything[itemId];
    if(!this.items[itemId])
        this.sysMsg(core.format("You don't have a {0} to drink.", itemId));
    else if(item.equipType != "potion")
        this.sysMsg(core.format("You can't drink a {0}, for it is a {1}.", itemId, item.equipType));
    else
    {
        dec(this.items, itemId);
        this.hp += item.strength;
        this.sysMsg(core.format("Health restored by {0} points.", item.strength));
    }
}

Body.prototype.cmd_equip = function (itemId)
{
    var itmCount = this.items[itemId];
    var itm = serverState.everything[itemId];
    if (itmCount === undefined || itmCount <= 0)
        this.sysMsg(core.format("You don't have the {0}.", itemId));
    else if (serverState.equipTypes.indexOf(itm.equipType) < 0)
        this.sysMsg(core.format("You can't equip the {0}.", itemId));
    else
    {
        var current = this.equipment[itm.equipType];
        if (current)
            inc(this.items, current);
        this.equipment[itm.equipType] = itemId;
        dec(this.items, itemId);
        this.sysMsg(core.format("You equiped the {0} as a {1}.", itemId, itm.equipType));
    }
}

Body.prototype.cmd_remove = function (itemId)
{
    for (var slot in this.equipment)
    {
        if (this.equipment[slot] == itemId)
        {
            inc(this.items, itemId);
            delete this.equipment[slot];
            this.sysMsg(core.format("You removed the {0} as your {1}.", itemId, slot));
            return;
        }
    }
    this.sysMsg(core.format("There is no {0} to remove.", itemId));
}

Body.prototype.cmd_who = function ()
{
    var msg = "People online:\n\n";
    msg += core.formatHash(function (k, v) { return core.format("*    {0} - {1}", k, v.roomId); }, serverState.everyone);
    this.sysMsg(msg);
}


Body.prototype.cmd_attack = function (targetId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(core.format("{0} is not here to attack.", targetId));
    else
    {
        var atk = 1;
        var wpnId = this.equipment["tool"];
        if (wpnId)
        {
            var wpn = serverState.everything[wpnId];
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
                var arm = serverState.everything[armId];
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
        this.sysMsg(core.format("You attacked {0} with {1} for {2} damage.", targetId, wpnId, atk));
    }
}

Body.prototype.cmd_loot = function(targetId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    if(!target)
        this.sysMsg(core.format("{0} is not here to loot.", targetId));
    else if(target.hp > 0)
        this.sysMsg(core.format("{0} knocks your hand away from his pockets.", targetId));
    else
    {
        for(var slot in target.equipment)
            target.cmd_remove(target.equipment[slot]);

        for(var itemId in target.items)
            this.moveItem(itemId, target.items, this.items, "looted", "from " + targetId, target.items[itemId]);
    }
}

module.exports = Body;
