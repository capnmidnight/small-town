// A few functions used in conjunction with
// hashMap and where
module.exports.equal = function(a, b) { return a == b; }
module.exports.notEqual = function(a, b) { return a != b; }
module.exports.key = function(k, v) { return k; }
module.exports.value = function(k, v) { return v; }

// Applies a module.exports.to the contents of an associative
// array, returning the results of each call on that
// module.exports.in an array.
//          - hsh: the associative array to process
//          - thunk: a function, taking two parameters "key" and "value",
//                              that returns a single-value result.
module.exports.hashMap = function(hsh, thunk)
{
    var output = [];
    for (var key in hsh)
        output[output.length] = thunk(key, hsh[key]);
    return output;
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
module.exports.where = function(hsh, getter, comparer, val)
{
    var output = {};
    if (hsh && getter && comparer)
        for (var key in hsh)
            if (comparer(getter(key, hsh[key]), val))
                output[key] = hsh[key];
    return output;
}

// Picks a random item out of an array
module.exports.selectRandom = function(arr)
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
module.exports.format = function()
{
    var template = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    return template.replace(/{(\d+)}/g, function(match, number)
    {
        return typeof args[number] != 'undefined'
          ? args[number]
          : match;
    });
}

// Frequently, it's necessary to print the status of a
// hash. This module.exports.will run the printing, or return
// the word "none" if there is nothing in the hash.
//    - formatter: a function, taking two parameters "key"
//            and "value", that returns a single-value
//            result, as in hashMap (as that is where it
//            will be used). The module.exports.should return
//                           a string.
//          - hsh: the associative array to process
module.exports.formatHash = function(formatter, hsh)
{
    if (hsh)
    {
        var strs = this.hashMap(hsh, formatter);
        if (strs.length > 0)
            return strs.join("\n\n");
    }
    return "*    none";
}

module.exports.hashSatisfies = function(onHand, required)
{
    for (var k in required)
        if (!onHand[k] || onHand[k] < required[k])
            return false;
    return true;
}

module.exports.inc = function(hsh, itm, amt)
{
    amt = amt || 1;
    if (!hsh[itm])
        hsh[itm] = 0;
    hsh[itm] += amt;
}

module.exports.dec = function(hsh, itm, amt)
{
    amt = amt || 1;
    if (hsh[itm])
    {
        hsh[itm] -= amt;
        if (hsh[itm] == 0)
            delete hsh[itm];
    }
}

module.exports.transfer = function(itm, from, to, amt)
{
    if (from[itm])
    {
        this.dec(from, itm, amt);
        this.inc(to, itm, amt);
        return true;
    }
    return false;
}
