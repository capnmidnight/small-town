var currentRooms = {

"test": new Room("a test room\n\nThere is not a lot to see here.\nThis is just a test room.\nIt's meant for testing.\nNothing more.\nGoodbye.",
      {"north": new Exit("test2"),
       "east": new Exit("test3"),
       "south": new Exit("test4", "feather", "you need a feather"),
       "west": null},
      {"sword": 1, "bird": 1, "rock": 5, "garbage": 0, "orb": 1, "hidden": 0}),
      
"test2": new Room("another test room\n\nKeep moving along",
       {"south": new Exit("test")},
       {"steel-wool": 4}),
       
"test3": new Room("a loop room\n\nit's probably going to work",
       {"south": new Exit("test5")}),

"test4": new Room("locked room\n\nThis room was locked with the bird",
       {"north": new Exit("test")}),

"test5": new Room("a loop room, 2\n\nit's probably going to work",
       {"west": new Exit("test4")})};

setIds(currentRooms);
