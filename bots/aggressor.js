var AIBody = require("./aibody.js");
var core = require("../core.js");

// Aggressor class
//  A violent NPC. Will alternate between moving and attacking
// players.
//  - roomId: the name of the room in which the Aggressor starts.
//  - hp: how much health the Aggressor starts with.
//  - items (optional): an associative array of item IDs to counts,
//          representing the stuff in the character's pockets.
//  - equipment (optional): an associative array of item IDs to
//          counts, representing the stuff in use by the character.

function Aggressor(db, roomId, hp, items, equipment, id)
{
    AIBody.call(this, db, roomId, hp, items, equipment, id);
    this.moving = true;
}

Aggressor.prototype = Object.create(AIBody.prototype);
module.exports = Aggressor;

Aggressor.prototype.idleAction = function ()
{
    var rm = this.db.rooms[this.roomId];
    if(rm)
    {
		var people = this.db.getPeopleIn(this.roomId);
		var targetId = core.selectRandom(core.keys(rm.users));
		var exit = core.selectRandom(core.keys(rm.exits));
		if(!this.moving && targetId)
		{
			this.cmd("say RAAAARGH!");
			this.cmd("attack " + targetId);
		}
		else if(exit)
			this.cmd(exit);
		this.moving = !this.moving;
	}
}
