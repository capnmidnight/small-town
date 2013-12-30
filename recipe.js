var Thing = require("./thing.js");
/* Recipe class
 *  A set of criteria to be able to create items in the
 *  users inventory. Each parameter is an associative array
 *  combining an item ID with a count.
 * 
 *  - db: a database of all Things.
 *  - id: the id to use for this Thing.
 *  - description: every Thing has a physical meaning to it,
 *      that is expressed through a description. For now, this is just
 *      prose text. One day, it might be more.
 *  - ingredients: the name and count of items that must be
 *          consumed out of the users inventory to be able
 *          to create the item.
 *  - results: the name and count of items that will be added
 *          to the users inventory after the recipe has ran.
 *  - tools (optional): the name and count of items that must exist in
 *          the users inventory (but will not get consumed).
 */
function Recipe(db, id, description, ingredients, results, tools)
{
	Thing.call(this, db, "recipes", id, description);
    this.ingredients = ingredients;
    this.results = results;
    this.tools = tools;
}
Recipe.prototype = Object.create(Thing.prototype);
module.exports = Recipe;
