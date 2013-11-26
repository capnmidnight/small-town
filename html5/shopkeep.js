function ShopKeep(roomId, hp, items, prices, equipment)
{
    AIBody.call(this, roomId, hp, items, equipment);
    this.prices = prices;
}

ShopKeep.prototype = Object.create(AIBody.prototype);

function forSaleDescription(k, v)
{
    return format("*    {0} ({1}) - {2}", k, v, hashMap(this.prices[k], curry(format, "{1} {0}")).join(","))
}

ShopKeep.prototype.react_tell = function (m)
{
    var people = getPeopleIn(this.roomId);
    var from = people[m.fromId];
    if (from)
    {
        var msg = m.payload[0];
        if (msg == "inv")
        {
            var itms = formatHash(forSaleDescription, this.items);
            if (itms.length == 0)
                itms = "nothing";
            else
                itms = "\n\n" + itms;
            this.tell(m.fromId, format("I have:{0}", itms));
        }
    }
}

ShopKeep.prototype.react_buy = function (m)
{
    var people = getPeopleIn(this.roomId);
    var from = people[m.fromId];
    if (from)
    {
        var itemId = m.payload[0];
        var item = this.items[itemId];
        var price = this.prices[itemId];
        if (item === undefined)
        {
            this.tell(m.fromId, "item not available");
        }
        else if (item == 0)
        {
            this.tell(m.fromId, "out of stock");
        }
        else if (!hashSatisfies(from.items, price))
        {
            this.tell(m.fromId, "price not met");
        }
        else
        {
            for (var k in price)
            {
                dec(from.items, k, price[k]);
                from.informUser(new Message(this.id, "take", [price[k], k]));
            }
            --item.count;
            inc(from.items, itemId);
            from.informUser(new Message(this.id, "give", [itemId]));
            this.tell(m.fromId, "pleasure doing business");
        }
    }
}

ShopKeep.prototype.idleAction = function ()
{
    // do nothing, and keep the shopkeep where they are set.
}
