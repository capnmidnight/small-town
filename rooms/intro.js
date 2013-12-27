exits:
    to Main-Square locked with sword "Don't forget to take the items (rusty metal and steel-wool) and use them to make a sword. Try \"take all\" followed by \"make sword\"."

items:
    steel-wool 10
    rusty-metal 10


new Room(serverState.rooms,
      "Introduction\n\nLearning the commands to the game important.\n"
    + "You can see all of the commands you're\n"
    + "capable of by typing <strong>help</strong> in the command\n"
    + "box below and either hitting your enter key\n"
    + "or tapping the enter button.\n"
    + "\n"
    + "You will have to take the items in this room\n"
    + "and make a sword in order to exit. type 'take steel-wool'\n"
    + "followed by 'take rusty-metal'. Then type 'make sword'.\n"
    + "You will the be able to leave this room by typing 'exit'.\n"
    + "Please don't take more than you need, or other new users\n"
    + "will not have enough to be able to exit for several minutes.",
      {
          "exit": new Exit("Main Square", "sword",
          
      },
      { "steel-wool": 10, "rusty-metal": 10 })
