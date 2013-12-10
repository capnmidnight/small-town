new Room(
      "Introduction\n\n\n\nLearning the commands to the game important.\n\n"
    + "You can see all of the commands you're\n\n"
    + "capable of by typing <strong>help</strong> in the command\n\n"
    + "box below and either hitting your enter key\n\n"
    + "or tapping the enter button.\n\n"
    + "\n\n"
    + "You will have to take the items in this room\n\n"
    + "and make a key in order to exit.\n\n",
      {
          "exit": new Exit("Main Square", "sword",
          "Don't forget to take the items (rusty metal"
        + "and steel-wool) and use them to make a sword.\n\n"
        + "Try \"take all\" followed by \"make sword\".\n\n")
      },
      { "steel-wool": 3, "rusty-metal": 1, "hat": 1 })