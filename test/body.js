var assert = require("assert");
var Body = require("../body.js");
describe("Body", function() {
	var roomId = "test";
	var hp = 25;
	var potionStrength = 10;
	var body = new Body(roomId, hp); // items, equipment, id, socket)
	body.db = {
		"itemCatalogue":{
			"potion": {
				"equipType": "food",
				"strength": potionStrength
			}
		}
	};
	
	describe("items", function(){
		it("should not start null", function(){
			assert.ok(body.items);
		});
	});
	
	describe("equipment", function(){
		it("should not start null", function(){
			assert.ok(body.equipment);
		});
	});
	
	describe("hp", function(){
		it("should start out at the test value", function(){
			assert.equal(body.hp, hp);
		});
	});
	
	describe("cmd_drink", function(){		
		it("should increase hp when drinking a potion", function(){
			body.items.potion = 1;
			var startHP = body.hp;
			body.cmd_drink("potion");
			assert.equal(body.hp, startHP + potionStrength);
		});
		
		it("should decrease potion count", function(){
			body.items.potion = 2;
			body.cmd_drink("potion");
			assert.equal(body.items.potion, 1);
		});
	});
});
