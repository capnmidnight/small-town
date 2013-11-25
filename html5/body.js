var currentCmds = ["quit", "help", "who", "look", "take", "drop", "give",
"inv", "make", "equip", "remove", "attack",
"say", "yell", "tell", "buy",
"north", "south", "east", "west"];

// Body class
//	A person, notionally. Both PCs and NPCs are represented as
//	Bodys right now, but NPCs get their inputQ filled by a different
//	source from PCs.
//	- roomId: the name of the room in which the Body starts.
//	- hp: how much health the Body starts with.
//	- items (optional): an associative array of item IDs to counts,
//			representing the stuff in the character's pockets.
//	- equipment (optional): an associative array of item IDs to
//			counts, representing the stuff in use by the character.	
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
    this.informUser(new Message(this.id, msg));
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

        var proc = this[cmd];
        if (currentCmds.indexOf(cmd) < 0 || !proc)
        {
            this.sysMsg(format("I don't understand \"{0}\".", cmd));
        }
        else if (params.length < proc.length)
        {
            this.sysMsg("not enough parameters");
        }
        else if (params.length > proc.length)
        {
            this.sysMsg("too many parameters");
        }
        else if(this.hp <= 0 && cmd != "quit")
        {
            this.sysMsg("knocked out!");
        }
        else
        {
            proc.apply(this, params);
        }
    }
}

Body.prototype.buy = function (targetId, itemId)
{
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
    {
        this.sysMsg(format("{0} is not here to buy from.", targetId));
    }
    else
    {
        target.informUser(new Message(this.id, "buy", [itemId]));
    }
}

Body.prototype.yell = function (msg)
{
    informUsers(everyone, new Message(this.id, "yell", [msg]));
}

Body.prototype.say = function (msg)
{
    informUsers(getPeopleIn(this.roomId), new Message(this.id, "say", [msg]));
}

Body.prototype.tell = function (targetId, msg)
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
    var msg = "";
    while (this.msgQ.length > 0)
    {
        var m = this.msgQ.shift();
        msg += format("{0} {1} {2}\n\n", m.fromId, m.message, m.payload.join(" "));
    }
    if (msg.length > 0)
        msg += format("{0} ({1}) :>", this.id, this.hp);
    if (msg.length > 0)
    {
        displayln(msg);
    }
}

Body.prototype.quit = function ()
{
    informUsers(everyone, new Message(this.id, "quit"));
    if (this.id == "player")
        done = true;
    delete everyone[this.id];
}

Body.prototype.help = function ()
{
    var msg = "Available commands:\n\n";
    for (var i = 0; i < currentCmds.length; ++i)
    {
        var func = this[currentCmds[i]];
        var src = func.toString();
        var j = src.indexOf(")");
        src = src.substring(0, j);
        src = src.replace("function ", "");
        src = src.replace("(", " ");
        src = src.replace(", ", " ");
        src = src.replace(",", " ");
        msg += format("*    {0} {1}\n\n", currentCmds[i], src);
    }
    this.sysMsg(msg);
}

Body.prototype.look = function ()
{
    var rm = getRoom(this.roomId);
    if (!rm)
    {
        this.sysMsg("What have you done!");
    }
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
    {
        this.sysMsg(format("You can't go that {0}. {1}.", dir, ((exit && exit.key) ? exit.lockMsg : "")));
    }
    else
    {
        informUsers(getPeopleIn(this.roomId), new Message(this.id, "left"));
        this.roomId = exit.roomId;
        informUsers(getPeopleIn(this.roomId), new Message(this.id, "entered"));
        this.look();
    }
}

Body.prototype.north = function () { this.move("north"); }
Body.prototype.east = function () { this.move("east"); }
Body.prototype.south = function () { this.move("south"); }
Body.prototype.west = function () { this.move("west"); }

Body.prototype.take = function (itemId)
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

Body.prototype.drop = function (itemId)
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

Body.prototype.give = function (targetId, itemId)
{
    var rm = getRoom(this.roomId);
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
    {
        this.sysMsg("{0} is not here", targetId);
    }
    else
    {
        this.moveItem(itemId, this.items, target.items, format("gave to {0}", targetId), "in your inventory");
        informUsers(people, new Message(this.id, "gave", [targetId]));
        target.informUser(new Message(this.id, "give", [itemId]));
    }
}

Body.prototype.make = function (recipeId)
{
    var recipe = recipes[recipeId];
    if (!hashSatisfies(this.items, recipe.tools))
    {
        this.sysMsg("You don't have all of the tools.");
    }
    else if (!hashSatisfies(this.items, recipe.ingredients))
    {
        this.sysMsg("You don't have all of the ingredients");
    }
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

Body.prototype.inv = function ()
{
    this.sysMsg(format("Equipped:\n\n{1}\n\nUnequipped:\n\n{0}\n\n***",
        formatHash(itemDescription, this.items),
        formatHash(equipDescription, this.equipment)));
}


Body.prototype.equip = function (itemId)
{
    var itmCount = this.items[itemId];
    var itm = itemCatalogue[itemId];
    if (itmCount === undefined || itmCount <= 0)
    {
        this.sysMsg(format("You don't have the {0}.", itemId));
    }
    else if (itm.equipType == "none")
    {
        this.sysMsg(format("You can't equip the {0}.", itemId));
    }
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

Body.prototype.who = function ()
{
    var msg = "People online:\n\n";
    var people = where(everyone, isAI, equal, false);
    msg += formatHash(function (k, v) { return format("*    {0} - {1}", k, v.roomId); }, people);
    this.sysMsg(msg);
}

Body.prototype.remove = function (itemId)
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


Body.prototype.attack = function (targetId)
{
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if (!target)
    {
        this.sysMsg(format("{0} is not here to attack.", targetId));
    }
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
        {
            wpnId = "bare fists";
        }
        target.hp -= atk;
        informUsers(people, new Message(this.id, "attack", [targetId]));
        target.informUser(new Message(this.id, "damage", [atk]));
        this.sysMsg(format("You attacked {0} with {1} for {2} damage.", targetId, wpnId, atk));
    }
}
