var aiCmds = ["east", "south", "west", "north"];
Body.prototype.initAI = function() {
    this.dt = Math.floor(Math.random() * 5) * 200 + 5000;
    this.lastTime = Date.now();
    this.target = null;
}

Body.prototype.takeRandomExit = function() {
    var rm = currentRooms[this.roomId];
    var exitIds = hashMap(rm.exits, key);
    this.move(selectRandom(exitIds));
}

Body.prototype.react = function (m) {
    var people = getPeopleIn(this.roomId);
    switch(m.message) {
        case "damage":
            this.yell(format("Ouch! Stop it, {0}!", m.fromId));
            this.target = m.fromId;
            break;
        case "tell":
            var msg = m.payload[0];
            if(msg == "inventory"
                && people[m.fromId]) {
                var itms = hashMap(this.items, key).join(", ");
                if(itms.length == 0)
                    itms = "nothing";
                this.tell(m.fromId, format("I have: {0}", itms));
            }
            else if(msg == "gift"){
                this.tell(m.fromId, "You have to ask nicely.");
            }
            else if(msg == "gift please"){
                this.give(m.fromId, selectRandom(hashMap(this.items, key)));
            }
            break;
        case "say":
            if(m.payload[0] == "hello")
                this.say("Hi!");
            break;
    }
}

Body.prototype.doAI = function() {
    var now = Date.now();
    
    if((now - this.lastTime) >= this.dt) {
        while(this.msgQ.length > 0){
            var m = this.msgQ.shift(); // ignore actions for now
            this.react(m);
        }
        if(this.target && getPeopleIn(this.roomId)[this.target]) {
            this.attack(this.target);
        }
        else{
            this.takeRandomExit();
        }
        this.lastTime = now;
    }
};
