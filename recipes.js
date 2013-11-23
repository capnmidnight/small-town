var recipes = {
    "dead-bird": new Recipe(
        {"bird": 1}, 
        {"dead-bird": 1, "feather": 5}, 
        {"shiny-sword": 1}),
    "shiny-sword": new Recipe(
        {"steel-wool": 3, "sword":1},
        {"shiny-sword": 1})
};
setIds(recipes);
