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
function Body(roomId, hp, items, equipment)
{
    this.roomId = roomId;
    this.hp = hp;
    this.items = items ? items : {};
    this.equipment = equipment ? equipment : {};
    this.msgQ = [];
    this.inputQ = [];
    this.id = null;
}

// Message class
//  All messages to the player are communicated through Messages.
//  The Message is structured such that the AI system can figure
//  out what was done it it, while also being able to inform the
//  user in a meaningful way what happened.
//  - fromId: the person who caused the message to occur.
//  - msg: the actual message, what happened.
//  - payload (optional): an array that provides detailed information
//          about the message.
function Message(fromId, msg, payload)
{
    this.fromId = fromId;
    this.message = msg;
    this.payload = payload || [];
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
            this.sysMsg(format("I don't understand \"{0}\".", cmd));
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
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("{0} is not here to buy from.", targetId));
    else
        target.informUser(new Message(this.id, "buy", [itemId]));
}

Body.prototype.cmd_sell = function (targetId, itemId)
{
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("{0} is not here to sell to.", targetId));
    else
        target.informUser(new Message(this.id, "sell", [itemId]));
}

Body.prototype.cmd_yell = function (msg)
{
    informUsers(everyone, new Message(this.id, "yell", [msg]));
}

Body.prototype.cmd_say = function (msg)
{
    informUsers(getPeopleIn(this.roomId), new Message(this.id, "say", [msg]));
}

Body.prototype.cmd_tell = function (targetId, msg)
{
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
    {
        this.sysMsg(format("{0} is not here to tell anything to.", targetId));
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
    if(this.msgQ.length > 0)
    {
        var msg = this.msgQ.map(function(m){
            return format("{0} {1} {2}\n\n", m.fromId, m.message, m.payload.join(" "));
        }).join("\n\n");

        this.msgQ = [];
        displayln(format("{0}{1} ({2}) :>", msg, this.id, this.hp));
    }
}

Body.prototype.cmd_quit = function ()
{
    informUsers(everyone, new Message(this.id, "quit"));
    if (this.id == "player")
        done = true;
    delete everyone[this.id];
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
            msg += format("*    {0} {1}\n\n", cmd, src);
        }
    }
    this.sysMsg(msg);
}

Body.prototype.cmd_look = function ()
{
    var rm = getRoom(this.roomId);
    if (!rm)
        this.sysMsg("What have you done!?");
    else
    {
        var items = where(rm.items, value, greaterThan, 0);
        var people = where(getPeopleIn(this.roomId), key, notEqual, this.id);
        var exits = where(rm.exits, value, notEqual, null);
        this.sysMsg(format("ROOM: {0}\n\nITEMS:\n\n{1}\n\nPEOPLE:\n\n{2}\n\nEXITS:\n\n{3}\n\n"
            + "***",
            rm.descrip,
            formatHash(itemDescription, items),
            formatHash(roomPeopleDescription, people),
            formatHash(exitDescription, exits)));
    }
}

Body.prototype.move = function (dir)
{
    var rm = getRoom(this.roomId);
    var exit = rm.exits[dir];
    if (!exit
        || !roomExists(exit.roomId)
        || exit.key
            && !this.items[exit.key])
        this.sysMsg(format("You can't go {0}. {1}.", dir, ((exit && exit.key) ? exit.lockMsg : "")));
    else
    {
        informUsers(getPeopleIn(this.roomId), new Message(this.id, "left"));
        this.roomId = exit.roomId;
        informUsers(getPeopleIn(this.roomId), new Message(this.id, "entered"));
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
    var rm = getRoom(this.roomId);

    if (itemId == "all")
    {
        for (var key in rm.items)
        {
            informUsers(getPeopleIn(this.roomId), new Message(this.id, "take", [key]));
            this.moveItem(key, rm.items, this.items, "picked up", "here", rm.items[key]);
        }
    }
    else
    {
        informUsers(getPeopleIn(this.roomId), new Message(this.id, "take", [itemId]));
        this.moveItem(itemId, rm.items, this.items, "picked up", "here");
    }
}

Body.prototype.cmd_drop = function (itemId)
{
    var rm = getRoom(this.roomId);
    this.moveItem(itemId, this.items, rm.items, "dropped", "in your inventory");
    informUsers(getPeopleIn(this.roomId), new Message(this.id, "drop", [itemId]));
}

Body.prototype.moveItem = function (itm, from, to, actName, locName, amt)
{
    if (transfer(itm, from, to, amt))
        this.sysMsg(format("You {0} the {1}.", actName, itm));
    else
        this.sysMsg(format("There is no {0} {1}", itm, locName));
}

Body.prototype.cmd_give = function (targetId, itemId)
{
    var rm = getRoom(this.roomId);
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("{0} is not here", targetId));
    else
    {
        this.moveItem(itemId, this.items, target.items, format("gave to {0}", targetId), "in your inventory");
        informUsers(people, new Message(this.id, "gave", [targetId]));
        target.informUser(new Message(this.id, "give", [itemId]));
    }
}

Body.prototype.cmd_make = function (recipeId)
{
    var recipe = recipes[recipeId];
    if(!recipe)
        this.sysMsg(format("{0} isn't a recipe.", recipeId));
    if (!hashSatisfies(this.items, recipe.tools))
        this.sysMsg("You don't have all of the tools.");
    else if (!hashSatisfies(this.items, recipe.ingredients))
        this.sysMsg("You don't have all of the ingredients");
    else
    {
        for (var key in recipe.ingredients)
        {
            dec(this.items, key, recipe.ingredients[key]);
            this.sysMsg(format("{0} {1}(s) removed from inventory.", recipe.ingredients[key], key));
        }

        for (var key in recipe.results)
        {
            inc(this.items, key, recipe.results[key]);
            this.sysMsg(format("You created {0} {1}(s).", recipe.results[key], key));
        }

        informUsers(getPeopleIn(this.roomId), new Message(this.id, "make", [recipeId]));
    }
}

Body.prototype.cmd_inv = function ()
{
    this.sysMsg(format("Equipped:\n\n{0}\n\nUnequipped:\n\n{1}\n\n***",
        formatHash(equipDescription, this.equipment),
        formatHash(itemDescription, this.items)));
}

Body.prototype.cmd_drink = function(itemId)
{
    var item = itemCatalogue[itemId];
    if(!this.items[itemId])
        this.sysMsg(format("You don't have a {0} to drink.", itemId));
    else if(item.equipType != "potion")
        this.sysMsg(format("You can't drink a {0}, for it is a {1}.", itemId, item.equipType));
    else
    {
        dec(this.items, itemId);
        this.hp += item.strength;
        this.sysMsg(format("Health restored by {0} points.", item.strength));
    }
}

Body.prototype.cmd_equip = function (itemId)
{
    var itmCount = this.items[itemId];
    var itm = itemCatalogue[itemId];
    if (itmCount === undefined || itmCount <= 0)
        this.sysMsg(format("You don't have the {0}.", itemId));
    else if (equipTypes.indexOf(itm.equipType) < 0)
        this.sysMsg(format("You can't equip the {0}.", itemId));
    else
    {
        var current = this.equipment[itm.equipType];
        if (current)
            inc(this.items, current);
        this.equipment[itm.equipType] = itemId;
        dec(this.items, itemId);
        this.sysMsg(format("You equiped the {0} as a {1}.", itemId, itm.equipType));
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
            this.sysMsg(format("You removed the {0} as your {1}.", itemId, slot));
            return;
        }
    }
    this.sysMsg(format("There is no {0} to remove.", itemId));
}

Body.prototype.cmd_who = function ()
{
    var msg = "People online:\n\n";
    msg += formatHash(function (k, v) { return format("*    {0} - {1}", k, v.roomId); }, everyone);
    this.sysMsg(msg);
}


Body.prototype.cmd_attack = function (targetId)
{
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
        this.sysMsg(format("{0} is not here to attack.", targetId));
    else
    {
        var atk = 1;
        var wpnId = this.equipment["tool"];
        if (wpnId)
        {
            var wpn = itemCatalogue[wpnId];
            if (wpn)
                atk += wpn.strength;
        }
        else
            wpnId = "bare fists";

        var def = 0;
        for(var i = 0; i < armorTypes.length; ++i)
        {
            var armId = target.equipment[armorTypes[i]];
            if(armId)
            {
                var arm = itemCatalogue[armId];
                if(arm)
                    def += arm.strength;
            }
        }
        atk = Math.max(atk - def, 0);
        target.hp -= atk;
        informUsers(people, new Message(this.id, "attack", [targetId]));
        target.informUser(new Message(this.id, "damage", [atk]));
        this.sysMsg(format("You attacked {0} with {1} for {2} damage.", targetId, wpnId, atk));
    }
}

Body.prototype.cmd_loot = function(targetId)
{
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if(!target)
        this.sysMsg(format("{0} is not here to loot.", targetId));
    else if(target.hp > 0)
        this.sysMsg(format("{0} knocks your hand away from his pockets.", targetId));
    else
    {
        for(var slot in target.equipment)
            target.cmd_remove(target.equipment[slot]);

        for(var itemId in target.items)
            this.moveItem(itemId, target.items, this.items, "looted", "from " + targetId, target.items[itemId]);
    }
}
