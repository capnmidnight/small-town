var Message = require("./message.js");
var core = require("./core.js");
var format = require("util").format;

var explain = {};

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
            body.cmd_quit();
        });
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
        while(this.msgQ.length > 0)
        {
            var m = this.msgQ.shift();
            this.socket.emit(m.type, format("%s %s %s", m.fromId, m.message, m.payload.join(" ")));
        }
        this.socket.emit("userStatus", format("%s (%d) :>", this.id, this.hp));
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

        var cmd = tokens[0];
        var params = tokens.slice(1);
        if (cmd == "say" || cmd == "yell")
            params = [params.join(" ")];
        else if (cmd == "tell" && params.length > 0)
            params = [params[0], params.slice(1).join(" ")];

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

Body.prototype.exchange = function(targetId, itemId, verb, dir)
{
    var people = this.db.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("%s is not here to %s %s.", targetId, verb, dir));
    else
        target.informUser(new Message(this.id, verb, [itemId], "chat"));
}

explain.buy = "Use: \"buy &lt;target name&gt; &lt;item name&gt;\"\n\n"
+"Ask to buy an item from someone. The target will check to see if you have the items to meet the cost, and automatically make the exchange if so.\n\n"
+"Use \"tell &lt;target name&gt; inv\" to see what they have for sale.\n\n"
+"Example:\n\n"
+"&gt; buy carlos hat\n\n"
+"&lt; carlos take player 5 gold\n\n"
+"&lt; carlos give player hat";
Body.prototype.cmd_buy = function (targetId, itemId)
{
    this.exchange(targetId, itemId, "buy", "from");
}

explain.sell = "Use: \"sell &lt;target name&gt; &lt;item name&gt;\"\n\n"
+"Ask to sell an item to someone. The target will check to see if you have the item and it can meet the cost, and automatically make the exchange if so.\n\n"
+"Use \"tell &lt;target name&gt; inv\" to see what they have the price for your item.\n\n"
+"Example:\n\n"
+"&gt; sell carlos hat\n\n"
+"&lt; carlos give player 5 gold\n\n"
+"&lt; carlos take player hat";
Body.prototype.cmd_sell = function (targetId, itemId)
{
    this.exchange(targetId, itemId, "sell", "to");
}

explain.retrieve = "Use: \"retrieve &lt;target name&gt; &lt;item name&gt;\"\n\n"
+"Ask your mule to give you an item it is holding for you. The target must know that it is your mule before it will give you the item.\n\n"
+"Use \"tell &lt;target name&gt; inv\" to see what they are carrying for you. The target must know that it is your mule bfore it will tell you what it is carrying.\n\n"
+"Mules are following you if they weren't following anyone when you told them to follow you, e.g. \"tell &lt;target name&gt; follow\"\n\n"
+"Example:\n\n"
+"&gt; retrieve carlos hat\n\n"
+"&lt; carlos give player hat";
Body.prototype.cmd_retrieve = function(targetId, itemId)
{
    this.exchange(targetId, itemId, "retrieve", "from");
}

explain.yell = "Use: \"yell &lt;message&gt;\"\n\n"
+"Send a message to all users on the server.\n\n"
+"Example:\n\n"
+"&gt; yell Hello, how are you doing?\n\n"
+"&lt; carlos yell SHADDAP!";
Body.prototype.cmd_yell = function (msg)
{
    var m = new Message(this.id, "yell", [msg], "chat");
    for(var userId in this.db.users)
        this.db.users[userId].informUser(m);
}

explain.say = "Use: \"say &lt;message&gt;\"\n\n"
+"Say something out loud. Only the people in the room with you will be able to hear it.\n\n"
+"Example:\n\n"
+"&gt; say Hello\n\n"
+"&lt; carlos say Hi!";
Body.prototype.cmd_say = function (msg)
{
    var m = new Message(this.id, "say", [msg], "chat");
    var people = this.db.getPeopleIn(this.roomId);
    if(people)
        for(var userId in people)
            people[userId].informUser(m);
}

explain.tell = "Use: \"tell &lt;target name&gt; &lt;message&gt;\"\n\n"
+"Send a private message to someone in the room.\n\n"
+"Example:\n\n"
+"&gt; tell carlos follow\n\n"
+"&lt; carlos tell player naaaay!";
Body.prototype.cmd_tell = function (targetId, msg)
{
    var people = this.db.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
    {
        this.sysMsg(format("%s is not here to tell anything to.", targetId));
    }
    else
    {
        target.informUser(new Message(this.id, "tell", [msg], "chat"));
    }
}

explain.quit = "Use: \"quit\"\n\n"
+"Quit playing the game.\n\n"
+"Example:\n\n"
+"&gt; quit\n\n"
+"&lt; player quit";
Body.prototype.cmd_quit = function ()
{
    var m = new Message(this.id, ["quit"], "chat");
    for(var userId in this.db.users)
        this.db.users[userId].informUser(m);
    this.quit = true;
}

explain.help = "Use: \"help\"\n\n"
+"Show all of the commands available to the user.";
Body.prototype.cmd_help = function ()
{
    var msg = "Available commands:\n\n";
    var row = "";
    var lines = [];
    for (var cmd in this)
    {
        if(cmd.indexOf("cmd_") >= 0)
        {
            var src = this[cmd].toString();
            var j = src.indexOf(")");
            src = src.substring(0, j)
                .replace("function ", "")
                .replace("(", " ")
                .replace(", ", " ")
                .replace(",", " ");
            cmd = cmd.replace("cmd_", "");
            var line = cmd + src;
            lines.push(line);
        }
    }
    lines.sort();
    msg += "<div class=\"columns\">" + lines.join("<br>") + "</div>";
    this.sysMsg(msg);
}

function roomPeopleDescription(k, v)
{
    return format("\t%s%s", k, (v.hp > 0 ? "" : " (KNOCKED OUT)"));
}

function exitDescription(k, v)
{
    return format("\t%s to %s", k, v.roomId);
}

function greaterThan(a, b) { return a > b; }

explain.look = "Use: \"look\"\n\n"
+"See a description of the current room.";
Body.prototype.cmd_look = function ()
{
    var rm = this.db.getRoom(this.roomId);
    if (!rm)
        this.sysMsg("What have you done!?");
    else
    {
        var items = core.where(rm.items, core.value, greaterThan, 0);
        var people = core.where(
            this.db.getPeopleIn(this.roomId),
            core.key,
            core.notEqual,
            this.id);
        var exits = {};
        for(var exitId in rm.exits)
        {
            var exit = rm.exits[exitId];
            if(exit && (!exit.cloak || this.items[exit.cloak]))
                exits[exitId] = exit;
        }
        var db = this.db;
        this.informUser(new Message("",
            format("ROOM: %s\n\nITEMS:\n\n%s\n\nPEOPLE:\n\n%s\n\nEXITS:\n\n%s\n\n<hr>",
                rm.descrip,
                core.formatHash(function(k, v)
                {
                    return format("\t%d %s - %s", v, k,
                        (db.itemCatalogue[k] ? db.itemCatalogue[k].descrip : "(UNKNOWN)"));
                }, items),
                core.formatHash(roomPeopleDescription, people),
                core.formatHash(exitDescription, exits)),
            null, "news"));
    }
}

Body.prototype.move = function (dir)
{
    var rm = this.db.getRoom(this.roomId);
    var exit = rm.exits[dir];
    var exitRoom = exit && this.db.getRoom(exit.roomId);
    if (!exit
        || !exitRoom
        || (exit.key && !this.items[exit.key]))
        this.sysMsg(format("You can't go %s. %s.", dir, ((exit && exit.key) ? exit.lockMsg : "")));
    else
    {
        var people = this.db.getPeopleIn(this.roomId);
        var m = new Message(this.id, "left", [dir], "chat");
        for(var userId in people)
            people[userId].informUser(m);
        this.roomId = exit.roomId;
        people = this.db.getPeopleIn(this.roomId);
        m = new Message(this.id, "entered", null, "chat");
        for(var userId in people)
            people[userId].informUser(m);
        this.cmd_look();
    }
}

function direxplain(dir){
    return format("Use: \"%s\"\n\n"
+"Move through the exit labeled \"%s\". If the exit is locked and the user doesn't have the key for the lock, the user will not change rooms.\n\n", dir, dir);
}
function movedir(dir){
    return function(){ this.move(dir); };
}
var dirs = ["north", "east", "south", "west", "leave", "up", "down", "enter", "exit"];
for(var i = 0; i < dirs.length; ++i)
{
    explain[dirs[i]] = direxplain(dirs[i]);
    Body.prototype["cmd_" + dirs[i]] = movedir(dirs[i]);
}

explain.explain = "I think you've figured it out by now.";
Body.prototype.cmd_explain = function(cmd)
{
    if(explain[cmd])
        this.sysMsg(format("%s: %s", cmd, explain[cmd]));
    else
        this.sysMsg(format("There is no command \"%s\"", cmd));
};

explain.take = "Use: \"take &lt;item name&gt;\"\n\n"
+"Take an item from the room.\n\n"
+"Use \"look\" to see what is in the room.\n\n"
+"Example:\n\n"
+"&gt; take hat\n\n"
+"&lt; player take hat";
Body.prototype.cmd_take = function (itemId)
{
    var rm = this.db.getRoom(this.roomId);
    var items = rm.items;
    if (itemId == "all")
    {
        for (itemId in items)
        {
            var people = this.db.getPeopleIn(this.roomId);
            var m = new Message(this.id, "take", [itemId], "chat");
            for(var userId in people)
                people[userId].informUser(m);
            this.moveItem(itemId, items, this.items, "picked up", "here", items[itemId]);
        }
    }
    else
    {
        var people = this.db.getPeopleIn(this.roomId);
        var m = new Message(this.id, "take", [itemId], "chat");
        for(var userId in people)
            people[userId].informUser(m);
        this.moveItem(itemId, items, this.items, "picked up", "here");
    }
}

explain.drop = "Use: \"drop &lt;item name&gt;\"\n\n"
+"Drop an item from inventory into the room.\n\n"
+"Use \"inv\" to see what is inventory.\n\n"
+"Example:\n\n"
+"&gt; drop hat\n\n"
+"&lt; player drop hat";
Body.prototype.cmd_drop = function (itemId)
{
    var rm = this.db.getRoom(this.roomId);
    this.moveItem(itemId, this.items, rm.items, "dropped", "in your inventory");
    var people = this.db.getPeopleIn(this.roomId);
    var m = new Message(this.id, "drop", [itemId], "chat");
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

explain.give = "Use: \"give &lt;target name&gt; &lt;item name&gt;\"\n\n"
+"Give an item from your inventory to a person in the room.\n\n"
+"Use \"inv\" to see what is your inventory.\n\n"
+"Example:\n\n"
+"&gt; give carlos hat\n\n"
+"&lt; player give carlos hat";
Body.prototype.cmd_give = function (targetId, itemId)
{
    var rm = this.db.getRoom(this.roomId);
    var people = this.db.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("%s is not here", targetId));
    else
    {
        this.moveItem(itemId, this.items, target.items, format("gave to %s", targetId), "in your inventory");
        var m = new Message(this.id, "give", [targetId, itemId], "chat");
        for(var userId in people)
            people[userId].informUser(m);
    }
}

explain.make = "Use: \"make &lt;item name&gt;\"\n\n"
+"If the ingredients and tools requirements are met for the recipe of the named item, then deducts the ingredients from the user's inventory and adds the recipe's result items to the user's inventory.\n\n"
+"Example:\n\n"
+"&gt; make hat\n\n"
+"&lt; player lose leather\n\n"
+"&lt; player receive hat";
Body.prototype.cmd_make = function (recipeId)
{
    var recipe = this.db.recipes[recipeId];
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
        var people = this.db.getPeopleIn(this.roomId);
        var m = new Message(this.id, "make", [recipeId], "chat");
        for(var userId in people)
            people[userId].informUser(m);
    }
}

explain.make = "Use: \"inv\"\n\n"
+"View what you have in your inventory";
Body.prototype.cmd_inv = function ()
{
    var db = this.db;
    this.sysMsg(format("Equipped:\n\n%s\n\nUnequipped:\n\n%s\n\n<hr>",
        core.formatHash(function (k, v)
        {
            return format("\t(%s) %s - %s", k, v,
                (db.itemCatalogue[v] ? db.itemCatalogue[v].descrip : "(UNKNOWN)"));
        }, this.equipment),
        core.formatHash(function(k, v)
        {
            return format("\t%d %s - %s", v, k,
                (db.itemCatalogue[k] ? db.itemCatalogue[k].descrip : "(UNKNOWN)"));
        }, this.items)));
}


explain.drink = "Use: \"drink &lt;item name&gt;\"\n\n"
+"Consume a potion to restore health.\n\n"
+"Example:\n\n"
+"&gt; drink potion\n\n"
+"&lt; player drink potion\n\n"
+"&lt; Health restored by 10 points.";
Body.prototype.cmd_drink = function(itemId)
{
    var item = this.db.itemCatalogue[itemId];
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

explain.equip = "Use: \"equip &lt;item name&gt;\"\n\n"
+"If the named item is a piece of equipment, readies the item for use. The item will no longer be considered in inventory.\n\n"
+"If there is already an item in the equipment slot, returns that old item to inventory first.\n\n"
+"Example:\n\n"
+"&gt; equip hat\n\n"
+"&lt; player equiped the hat as a helmet";
Body.prototype.cmd_equip = function (itemId)
{
    var itmCount = this.items[itemId];
    var itm = this.db.itemCatalogue[itemId];
    if (itmCount === undefined || itmCount <= 0)
        this.sysMsg(format("You don't have the %s.", itemId));
    else if (this.db.equipTypes.indexOf(itm.equipType) < 0)
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

explain.remove = "Use: \"remove &lt;item name&gt;\"\n\n"
+"Removes the item from use as equipment and returns it to inventory.\n\n"
+"Example:\n\n"
+"&gt; remove hat\n\n"
+"&lt; player removed the hat as a helmet";
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

explain.who = "Use: \"who\"\n\n"
+"List all users who are online, and where they are located.";
Body.prototype.cmd_who = function ()
{
    var msg = "People online:\n\n";
    msg += core.formatHash(function (k, v) { return format("\t%s - %s", k, v.roomId); }, this.db.users);
    this.sysMsg(msg);
}


explain.attack = "Use: \"attack &lt;target name&gt;\"\n\n"
+"Strikes the target once in combat.\n\n"
+"Equipped weapons make the attacks perform more damage.\n\n"
+"Targets with armor equipped take less damage.";
Body.prototype.cmd_attack = function (targetId)
{
    var people = this.db.getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("%s is not here to attack.", targetId));
    else
    {
        var atk = 1;
        var wpnId = this.equipment["tool"];
        if (wpnId)
        {
            var wpn = this.db.itemCatalogue[wpnId];
            if (wpn)
                atk += wpn.strength;
        }
        else
            wpnId = "bare fists";

        var def = 0;
        for(var i = 0; i < this.db.armorTypes.length; ++i)
        {
            var armId = target.equipment[this.db.armorTypes[i]];
            if(armId)
            {
                var arm = this.db.itemCatalogue[armId];
                if(arm)
                    def += arm.strength;
            }
        }
        atk = Math.max(atk - def, 0);
        target.hp -= atk;
        var m = new Message(this.id, "attack", [targetId], "chat");
        for(var userId in people)
            people[userId].informUser(m);
        target.informUser(new Message(this.id, "damage", [atk], "chat"));
        this.sysMsg(format("You attacked %s with %s for %d damage.", targetId, wpnId, atk));
    }
}

explain.loot = "Use: \"loot &lt;target name&gt;\"\n\n"
+"If the target is knocked out after combat, takes everything it has as inventory and equipment.\n\n"
+"Example:\n\n"
+"&gt; loot carlos\n\n"
+"&lt; player looted a hat\n\n"
+"&lt; player looted a bird";
Body.prototype.cmd_loot = function(targetId)
{
    var people = this.db.getPeopleIn(this.roomId);
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
