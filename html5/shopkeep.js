function ShopKeep(roomId, hp, items, prices, equipment)
{
    AIBody.call(this, roomId, hp, items, equipment);
    this.prices = prices;
}

ShopKeep.prototype = Object.create(AIBody.prototype);

ShopKeep.prototype.react_tell = function (m)
{
    var people = getPeopleIn(this.roomId);
    var target = people[m.fromId];
    if (target)
    {
        var msg = m.payload[0];
        if (msg == "inv")
        {
            var output = "";
            for(var itemId in this.items)
                if(this.prices[itemId])
                    output += format("*    {0} ({1}) - {2}\n\n", itemId, this.items[itemId],
                        hashMap(this.prices[itemId], vkString).join(","));
            if (output.length == 0)
                output = " nothing";
            else
                output = "\n\n" + output;
            this.cmd(format("tell {0} I have:{1}", m.fromId, output));
        }
    }
}

ShopKeep.prototype.react_buy = function (m)
{
    var people = getPeopleIn(this.roomId);
    var target = people[m.fromId];
    if (target)
    {
        var itemId = m.payload[0];
        var item = this.items[itemId];
        var price = this.prices[itemId];
        if (!item)
            this.cmd(format("tell {0} item not available", m.fromId));
        else if (!hashSatisfies(target.items, price))
            this.cmd(format("tell {0} price not met", m.fromId));
        else
        {
            this.cmd(format("sell {0} {1}", m.fromId, itemId));
            this.cmd(format("tell {0} pleasure doing business",
                m.fromId));
        }
    }
}

ShopKeep.prototype.react_sell = function (m)
{
    var people = getPeopleIn(this.roomId);
    var target = people[m.fromId];
    if (target)
    {
        var itemId = m.payload[0];
        var item = target.items[itemId];
        var price = this.prices[itemId];
        if (!item)
        {
            this.cmd(format("tell {0} you don't have that item",
                m.fromId));
        }
        else if (!hashSatisfies(this.items, price))
        {
            this.cmd(format("tell {0} I can't afford that", m.fromId));
        }
        else
        {
            this.cmd(format("buy {0} {1}", m.fromId, itemId));
            this.cmd(format("tell {0} pleasure doing business",
                m.fromId));
        }
    }
}

ShopKeep.prototype.cmd_buy = function(targetId, itemId) {
    var people = getPeopleIn(this.roomId);
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
    var people = getPeopleIn(this.roomId);
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
