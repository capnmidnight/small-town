Introduction
============
This is a basic Multi-User Dungeon written in Node.JS. The goal is to use this as a test-bed for works in interactive fiction.

It runs a WebSockets server that serves up a basic HTML page that is used as a client to connect to the game. The game runs off of simple text-file formats defining the items and rooms that the user can interact with. AI bots are a little difficult to define right now, but technically can be any level of complexity.

Playing the game
================
When the server is running and you connect to site, You're presented with a textbox in which to enter commands and a large field of text to display the results from the server. The gameplay follows fairly basic text-adventure style commands. I'm not going to link you to any particular MUDs. The ones I used to play are no longer running, and the ones that are still running are not very accessible. However, I would suggest playing the original Zork:
	http://pot.home.xs4all.nl/infocom/zork1.html

Imagine "now add other people" and that should give you an idea of how these sorts of games go.

Contributing
============
I'll take pull requests from just about anyone, considering I doubt just about anyone will want to contribute. I'll seriously consider adding you as a contributor if you ask.

* Install Node.JS (http://nodejs.org/). I'm currently on v0.10.22, but the latest version should work. If it doesn't, I'm interested in upgrading the code to make it work. The goal is to keep abreast with the latest version of Node. The installers for Node should setup everything needed to be able to use it from the command line.
* Sign up for Github.
* Clone the source code to your local machine. If you are on OS X or Windows, use the "Github for Mac" (http://mac.github.com/) or "Github for Windows" (http://windows.github.com/) program. After it is installed, you have ran it, and you have entered your Github credentials, return to this page and click the "Cloan to Desktop" button in the right-most column.
* Pay attention to where Github for Windows copies the code, or click the gear icon in the upper right of the window and select "Open a shell here". This should open a command line window that you can use for the next step.
* Using a command line tool (`cmd` or `PowerShell` on windows, `Terminal` on OS X, or whatever terminal emulator you want on Linux), enter the command `npm install`. NPM is the Node Package Manager (https://npmjs.org/). The command will read the `package.json` file and find the necessary libraries to download and install for the project. There aren't many.
* Install a text editor with syntax highlighting. I sometimes use:
    * Geany (http://www.geany.org/): it's available on many platforms, so it's nice to have one program I can use on all of my computers.
	* notepad++ (http://notepad-plus-plus.org/): it has a very clean UI that stays out of the way.
	* Visual Studio Express 2013 for Web (http://www.microsoft.com/en-us/download/details.aspx?id=40747): I'm tending to get away from Visual Studio these days, but I'm very used to its text searching tools, so I sometimes use it out of habit.
	* notepad2 (http://www.flos-freeware.ch/notepad2.html): Another very simple alternative.
* Start editing code!

Running the server
==================
To run the game, use the command line in the project directory and run the command `node server`. This will start the server and wait for connections to be made from a browser. Use your favorite internet browser and connect to http://localhost:8080. This should display the green client page and you should be able to play the game.

Playing the game
================
Once connected to the server, follow the on-screen instructions.

* Enter a username
	* if someone is already logged in with that user name (including an AI bot), then you must pick another user name.
    * if this is the first time anyone is using that name, you'll be asked to enter a password and a new user account will be created for you. PASSWORDS ARE NOT ENCRYPTED! Also, user account files will get pushed up to the repository the next time you commit code. Therefore, do not use a password that you use anywhere else.
	* if this is not the first time you have connected, then you must enter the password you entered when you created the account. You have an unlimited number of attempts.
* Read the first room description and enter commands as you wish!

Commands
========
    buy targetId itemId
    sell targetId itemId
    yell msg
    say msg
    tell targetId msg
    quit
    help
    look
    north
    east
    south
    west
    leave
    up
    down
    enter
    exit
    take itemId
    drop itemId
    give targetId itemId
    make recipeId
    inv
    drink itemId
    equip itemId
    remove itemId
    who
    attack targetId
    loot targetId
