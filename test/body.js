var assert = require("assert");
var Body = require("../body.js");
describe("Body", function() {
	var roomId = "test";
	var hp = 25;
	var body = new Body(roomId, hp); // items, equipment, id, socket)
	
	describe("items", function(){
		it("should not start null", function(){
			assert.isNotNull(body.items);
		});
	});
	
	describe("hp", function(){
		it("should start out at the test value", function(){
			assert.equal(body.hp, hp);
		});
		
		it("should increase when drinking a potion", function(){
			body.items.potion = 1;
			var startHP = body.hp;
			body.cmd_drink("potion");
			assert.equal(body.hp, startHP + 10);
		});
	});
});
