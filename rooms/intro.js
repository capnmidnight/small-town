new Room(serverState.rooms,
      "Introduction\n\nLearning the commands to the game important.\n"
    + "You can see all of the commands you're\n"
    + "capable of by typing <strong>help</strong> in the command\n"
    + "box below and either hitting your enter key\n"
    + "or tapping the enter button.\n"
    + "\n"
    + "You will have to take the items in this room\n"
    + "and make a key in order to exit.\n",
      {
          "exit": new Exit("Main Square", "sword",
          "Don't forget to take the items (rusty metal "
        + "and steel-wool) and use them to make a sword.\n"
        + "Try \"take all\" followed by \"make sword\".\n")
      },
      { "steel-wool": 3, "rusty-metal": 1, "hat": 1 })
