// A few functions used in conjunction with
// hashMap and where
function equal(a, b) { return a == b; }
function notEqual(a, b) { return a != b; }
function greaterThan(a, b) { return a > b; }
function key(k, v) { return k; }
function value(k, v) { return v; }
function pair(k, v) { return [k, v]; }
function kvString(k, v){return format("{0} {1}", k, v);}
function vkString(k, v){return format("{0} {1}", v, k);}

function curry(f, v)
{
        var g = function()
        {
            [].unshift.call(arguments, v);
            f.apply(this, arguments);
        }
        return g;
}

// Applies a function to the contents of an associative
// array, returning the results of each call on that
// function in an array.
//          - hsh: the associative array to process
//          - thunk: a function, taking two parameters "key" and "value",
//                              that returns a single-value result.
function hashMap(hsh, thunk)
{
    var output = [];
    for (var key in hsh)
        output[output.length] = thunk(key, hsh[key]);
    return output;
}

// Picks a random item out of an array
function selectRandom(arr)
{
    if(arr)
        return arr[Math.floor(Math.random() * arr.length)];
}

// Makes templated strings.
//   - template: a string that uses {#} placeholders,
//               where # is an integer number representing
//               an index into the args parameter array that
//               will be used to replace the placeholder.
//   - [args...]: a variable-length argument list that
//               contains each of the elements that will
//               replace the placeholders in the template.
function format()
{
    var template = arguments[0];
    var args = [].slice.call(arguments, 1);
    return template.replace(/{(\d+)}/g, function (match, number)
    {
        return typeof args[number] != 'undefined'
          ? args[number]
          : match;
    });
}

// Frequently, it's necessary to print the status of a
// hash. This function will run the printing, or return
// the word "none" if there is nothing in the hash.
//    - formatter: a function, taking two parameters "key"
//            and "value", that returns a single-value
//            result, as in hashMap (as that is where it
//            will be used). The function should return
//                           a string.
//          - hsh: the associative array to process
function formatHash(formatter, hsh)
{
    if (hsh)
    {
        var strs = hashMap(hsh, formatter);
        if (strs.length > 0)
            return strs.join("\n\n");
    }
    return "*    none";
}

// filters an associative array.
//    - hsh: the associative array to process.
//    - getter: a function, taking two parameters "key"
//            and "value", that returns a single-value
//            result, as in hashMap.
//    - comparer: a function, taking two values A and B,
//            that compares the output of getter to the
//            val parameter.
//    - val: a filtering value.
function where(hsh, getter, comparer, val)
{
    var output = {};
    if (hsh && getter && comparer)
        for (var key in hsh)
            if (comparer(getter(key, hsh[key]), val))
                output[key] = hsh[key];
    return output;
}

function hashSatisfies(onHand, required)
{
    for (var k in required)
        if (!onHand[k] || onHand[k] < required[k])
            return false;
    return true;
}

function inc(hsh, itm, amt)
{
    amt = amt || 1;
    if (!hsh[itm])
        hsh[itm] = 0;
    hsh[itm] += amt;
}

function dec(hsh, itm, amt)
{
    amt = amt || 1;
    if (hsh[itm])
    {
        hsh[itm] -= amt;
        if (hsh[itm] == 0)
            delete hsh[itm];
    }
}

function transfer(itm, from, to, amt)
{
    if (from[itm])
    {
        dec(from, itm, amt);
        inc(to, itm, amt);
        return true;
    }
    return false;
}

function getPeopleIn(roomId)
{
    return where(everyone, function (k, v) { return v.roomId; }, equal, roomId);
}

function isAI(k, v)
{
    return v instanceof AIBody;
}

function getRealPeopleIn(roomId)
{
            return where(everyone, function(k, v){ return !(v instanceof AIBody) && (!roomId || v.roomId == roomId);}, equal, true);
}

function itemDescription(k, v)
{
    return format("*    {1} {0} - {2}", k, v,
        (itemCatalogue[k] ? itemCatalogue[k].descrip : "(UNKNOWN)"));
}

function equipDescription(k, v)
{
    return format("*    ({0}) {1} - {2}", k, v,
        (itemCatalogue[v] ? itemCatalogue[v].descrip : "(UNKNOWN)"));
}

function roomPeopleDescription(k, v)
{
    return format("*    {0}{1}", k, (everyone[k].hp > 0 ? "" : " (KNOCKED OUT)"));
}

function exitDescription(k, v)
{
    return format("*    {0}{1}", k, ((v && roomExists(v.roomId)) ? "" : " (UNDER CONSTRUCTION)"));
}

function getRoom(id) { return currentRooms[id]; }
function setRoom(id, rm) { currentRooms[id] = rm; }
function roomExists(id) { return getRoom(id) != null; }

function informUsers(usrs, msg)
{
    for (var userId in usrs)
        everyone[userId].informUser(msg);
}

// gives every object in an associative array access to its
// own key name.
function setIds(hsh) { for (var k in hsh) hsh[k].id = k; }
