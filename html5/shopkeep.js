var AIBody = require("./aibody.js");
var core = require("./core.js");
var serverState = require("./serverState.js");

function ShopKeep(roomId, hp, items, prices, equipment, id)
{
    AIBody.call(this, roomId, hp, items, equipment, id);
    this.prices = {};
    for(var sellId in prices)
    {
        this.prices[sellId] = {};
        for(var costId in prices[sellId])
            this.prices[sellId][costId] = prices[sellId][costId];
    }
}

module.exports = ShopKeep;

ShopKeep.prototype = Object.create(AIBody.prototype);

ShopKeep.prototype.copyTo = function(obj)
{
    ShopKeep.call(obj, this.roomId, this.hp, this.items, this.prices, this.equipment, this.id);
}

function vkString(k, v){return core.format("{0} {1}", v, k);}
ShopKeep.prototype.react_tell = function (m)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[m.fromId];
    if (target)
    {
        var msg = m.payload[0];
        if (msg == "inv")
        {
            var output = "";
            for(var itemId in this.items)
                if(this.prices[itemId])
                    output += core.format("*    {0} ({1}) - {2}\n\n", itemId, this.items[itemId],
                        core.hashMap(this.prices[itemId], vkString).join(","));
            if (output.length == 0)
                output = " nothing";
            else
                output = "\n\n" + output;
            this.cmd(core.format("tell {0} I have:{1}", m.fromId, output));
        }
        else
            AIBody.prototype.react_tell.call(this, m);
    }
}

ShopKeep.prototype.react_buy = function (m)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[m.fromId];
    if (target)
    {
        var itemId = m.payload[0];
        var item = this.items[itemId];
        var price = this.prices[itemId];
        if (!item)
            this.cmd(core.format("tell {0} item not available", m.fromId));
        else if (!core.hashSatisfies(target.items, price))
            this.cmd(core.format("tell {0} price not met", m.fromId));
        else
        {
            this.cmd(core.format("sell {0} {1}", m.fromId, itemId));
            this.cmd(core.format("tell {0} pleasure doing business",
                m.fromId));
        }
    }
}

ShopKeep.prototype.react_sell = function (m)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[m.fromId];
    if (target)
    {
        var itemId = m.payload[0];
        var item = target.items[itemId];
        var price = this.prices[itemId];
        if (!item)
        {
            this.cmd(core.format("tell {0} you don't have that item",
                m.fromId));
        }
        else if (!core.hashSatisfies(this.items, price))
        {
            this.cmd(core.format("tell {0} I can't afford that", m.fromId));
        }
        else
        {
            this.cmd(core.format("buy {0} {1}", m.fromId, itemId));
            this.cmd(core.format("tell {0} pleasure doing business",
                m.fromId));
        }
    }
}

ShopKeep.prototype.cmd_buy = function(targetId, itemId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    var item = this.items[itemId];
    var price = this.prices[itemId];
    if(target && item && price)
    {
        for (var k in price)
            this.cmd_give(targetId, k, price[k]);
        target.cmd_give(this.id, itemId);
    }
}

ShopKeep.prototype.cmd_sell = function(targetId, itemId)
{
    var people = serverState.getPeopleIn(this.roomId);
    var target = people[targetId];
    var item = this.items[itemId];
    var price = this.prices[itemId];
    if(target && item && price)
    {
        for (var k in price)
            target.cmd_give(this.id, k, price[k]);
        this.cmd_give(targetId, itemId);
    }
}

ShopKeep.prototype.idleAction = function ()
{
    // do nothing, and keep the shopkeep where they are set.
}
