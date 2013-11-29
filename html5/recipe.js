// Recipe class
//  A set of criteria to be able to create items in the
//  users inventory. Each parameter is an associative array
//  combining an item ID with a count.
//  - ingredients: the name and count of items that must be
//          consumed out of the users inventory to be able
//          to create the item.
//  - results: the name and count of items that will be added
//          to the users inventory after the recipe has ran.
//  - tools (optional): the name and count of items that must exist in
//          the users inventory (but will not get consumed).
function Recipe(ingredients, results, tools)
{
    this.ingredients = ingredients;
    this.results = results;
    this.tools = tools;
    this.id = null;
}

module.exports = Recipe;
