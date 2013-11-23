var currentCmds = ["quit", "help", "look", "take", "takeall", "drop", "give", 
"inv", "make", "equip", "remove", "attack", 
"north", "south", "east", "west"];

Body.prototype.doCommand = function(){
    var str = this.inputQ.pop();
    displayln(str);
    if(str.length > 0){
        var tokens = str.split(" ");
        var params = tokens.slice(1);
        var cmd = tokens[0];
        if(currentCmds.indexOf(cmd) < 0){
            displayln(format("I don't understand \"{0}\".", cmd));
        }
        else{
            var proc = this[cmd];
            if(params.length < proc.length){
                displayln("not enough parameters");
            }
            else if(params.length > proc.length){
                displayln("too many parameters");
            }
            else{
                proc.apply(this, params);
            }
        }
    }
}

Body.prototype.quit = function() {
    informUsers(everyone, this.id, ["quit"]);
    if(this.id == "player")
        done = true;
    delete everyone[this.id];
}

Body.prototype.help = function() { 
    displayln("Available commands:");
    for(var i = 0; i < currentCmds.length; ++i){
        var func = this[currentCmds[i]];
        var src = func.toString();
        var j = src.indexOf(")");
        src = src.substring(0, j);
        src = src.replace("function ", "");
        src = src.replace("(", " ");
        src = src.replace(", ", " ");
        src = src.replace(",", " ");            
        displayln(format("- {0} {1}", currentCmds[i], src));
    }
}

Body.prototype.look = function() {
    var rm = getRoom(this.roomId);
    if(rm){
        var items = where(rm.items, value, greaterThan, 0);
        var people = where(getPeopleIn(this.roomId), key, notEqual, this.id);
        var exits = where(rm.exits, value, notEqual, null);
            displayln(format("ROOM: {0}\n\nITEMS:\n\n{1}\n\nPEOPLE:\n\n{2}\n\nEXITS:\n\n{3}\n\n"
                + "***",
                rm.descrip,
                formatHash(itemDescription, items),
                formatHash(roomPeopleDescription, people),
                formatHash(exitDescription, exits)));
    }
}

Body.prototype.move = function(dir) {
    var rm = getRoom(this.roomId);
    var exit = rm.exits[dir];
    if(roomExists(exit.roomId) && (!exit.key || this.items[exit.key])){
        informUsers(getPeopleIn(this.roomId), this.id, ["left"]);
        this.roomId = exit.roomId;
        informUsers(getPeopleIn(this.roomId), this.id, ["entered"]);
        this.look();
    }
    else
        displayln("You can't go that way. " + (exit.key ? exit.lockMsg : ""));
}

Body.prototype.north = function(){ this.move("north"); }
Body.prototype.east = function(){ this.move("east"); }
Body.prototype.south = function(){ this.move("south"); }
Body.prototype.west = function(){ this.move("west"); }

Body.prototype.take = function(itemId) {
    var rm = getRoom(this.roomId);
    moveItem(itemId, rm.items, this.items, "picked up", "here", amt);
    informUsers(getPeopleIn(this.roomId), this.id, ["take", itemId]);
}

Body.prototype.takeall = function() {
    var rm = getRoom(this.roomId);
    for(var itemId in rm.items){
        moveItem(itemId, rm.items, this.items, "picked up", "here", rm.items[itemId]);
        informUsers(getPeopleIn(this.roomId), this.id, ["take", itemId]);
    }
}

Body.prototype.drop = function(itemId) {
    var rm = getRoom(this.roomId);
    moveItem(itemId, this.items, rm.items, "dropped", "in your inventory");
    informUsers(getPeopleIn(this.roomId), this.id, ["drop", itemId]);
}

Body.prototype.give = function(targetId, itemId) {
    var rm = getRoom(this.roomId);
    var people = getPeopleIn(this.roomId);
    var target = people(targetId);
    if(target) {
        moveItem(itemId, this.items, target.items, format("gave to {0}", targetId), "in your inventory");
        informUsers(people, this.id, ["give", targetId, itemId]);
    }
    else{
        displayln("{0} is not here", targetId);
    }
}

Body.prototype.make = function(recipeId) {
    var recipe = recipes[recipeId];
    if(!hashSatisfies(this.items, recipe.tools)) {
        displayln("You don't have all of the tools.");
    }
    else if(!hashSatisfies(this.items, recipe.ingredients)) {
        displayln("You don't have all of the ingredients");
    }
    else {
        for(var key in recipe.ingredients) {
			dec(this.items, key, recipe.ingredients[key]);
            displayln(format("{0} {1}(s) removed from inventory.", recipe.ingredients[key], key));
        }
        
        for(var key in recipe.results) {
			inc(this.items, key, recipe.results[key]);
            displayln(format("You created {0} {1}(s).", recipe.results[key], key));
        }
        
        informUsers(getPeopleIn(this.roomId), this.id, ["make", recipeId]);
    }
}

Body.prototype.inv = function() {
    displayln(format("Equipped:\n\n{1}\n\nUnequipped:\n\n{0}\n\n***",
        formatHash(itemDescription, this.items),
        formatHash(equipDescription, this.equipment)));
}


Body.prototype.equip = function(itemId) {
    var itmCount = this.items[itemId];
    if(itmCount === undefined || itmCount <= 0) {
         displayln(format("You don't have the {0}.", itemId));
    }
    else {
        var itm = itemCatalogue[itemId];
        if(itm.equipType == "none") {
            displayln(format("You can't equip the {0}.", itemId));
        }
        else{
            var current = this.equipment[itm.equipType];
            if(current)
				inc(this.items, current);
            this.equipment[itm.equipType] = itemId;
            dec(this.items, itemId);
            displayln(format("You equiped the {0} as a {1}.", itemId, itm.equipType));
        }
    }
}

Body.prototype.remove = function(itemId) {
    for(var slot in this.equipment){
        if(this.equipment[slot] == itemId){
			inc(this.items, itemId);
            delete this.equipment[slot];
            displayln(format("You removed the {0} as your {1}.", itemId, slot));
            return;
        }
    }
    displayln(format("There is no {0} to remove.", itemId));
}


Body.prototype.attack = function(targetId) {
    var atk = 1;
    var wpnId = this.equipment["tool"];
    if(wpnId){
        var wpn = itemCatalogue[wpnId];
        if(wpn)
            atk = wpn.strength;
    }
    else{
        wpnId = "nothing";
    }
    var people = getPeopleIn(this.roomId);
    var target = people[targetId];
    if(target) {
        target.hp -= atk;
        informUsers(people, this.id, ["attack", targetId]);
        informUser(targetId, this.id, ["damage", atk]);
        displayln(format("You attack {0} with {1} for {2} damage.", targetId, wpnId, atk));
    }
    else {
        displayln(format("There is no {0} to attack.", targetId));
    }
}
