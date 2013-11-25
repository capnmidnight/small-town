function ShopKeep(roomId, hp, forSale, items, equipment)
{
    AIBody.call(this, roomId, hp, items, equipment);
    this.forSale = forSale;
}

function Lot(count, price)
{
    this.count = count;
    this.price = price;
}

ShopKeep.prototype = Object.create(AIBody.prototype);

function forSaleDescription(k, v)
{
    return format("*    {0} ({1}) - {2}", k, v.count, hashMap(v.price, curry(format, "{1} {0}")).join(","))
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
            var itms = formatHash(forSaleDescription, this.forSale);
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
        var item = this.forSale[itemId];
        if (!item)
        {
            this.tell(m.fromId, "item not available");
        }
        else if (item.count == 0)
        {
            this.tell(m.fromId, "out of stock");
        }
        else if (!hashSatisfies(from.items, item.price))
        {
            this.tell(m.fromId, "price not met");
        }
        else
        {
            for (var k in item.price)
            {
                dec(from.items, k, item.price[k]);
                from.informUser(new Message(this.id, "take", [k]));
            }
            --item.count;
            inc(from.items, itemId);
            from.informUser(new Message(this.id, "give", [itemId]));
            this.tell(m.fromId, "pleasure doing business");
        }
    }
}

ShopKeep.prototype.takeRandomExit = function ()
{
    // do nothing, and keep the shopkeep where they are set.
}
