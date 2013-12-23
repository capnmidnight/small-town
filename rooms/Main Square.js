new Room(serverState.rooms,
    "Main Square\n\n\n\n"
  + "Welcome! You made it! There is nowhere else to go. You are stuck here.",
    {"south": new Exit("Market")},
    null,
    {
		"Begbie": new Scavenger("Main Square", 10),
		"Virginia": new AIBody("Main Square", 10),
		"mule": new Mule("Main Square", 10, "naaay", { "apple": 5, "log": 3 })
	})
