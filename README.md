Introduction
============
Play the game live here: http://seanmcbeth.com:8081/

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
* When you are satisfied with your changes, use the Github program to create a "commit". Commits are sets of file changes that represent the work you did on the code after you cloned it.
    * It is best to have each commit represent a "good" state of the program. It should be possible to be able to run the program without error from any commit in time. This isn't necessarily always possible, but try your best.
	* It's also a good idea to try to make commits as small as possible. They should be limited to one feature or one bug fix at a time. That way, it's easier to tell where work for each one starts and ends.
* When you're satisfied with the work you've done and you want to share you're work with everyone, use the "sync" command in the Github program to push changes up to this account. It will also pull any changes anyone else made at the same time.
   * Sometimes, when two people work on the same file and don't realize it, a "conflict" can occur. Conflicts can be difficult to fix. The easiest thing is to discard your changes, take the code from the server, and redo your changes. This is one of the reasons we tend to try to keep commmits small, as it limits the opportunities for conflicts.
   * But sometimes, it can't be done easily, so you'll have to create a "merge commit". A merge commit is basically you editing the conflicted files until they no longer cause an error when ran, then making a new commit. It's harder to keep everything straight with a merge commit. But hopefully, it shouldn't happen very often. Communicate with the team whenever you have trouble and someone will help you out.

Running the server
==================
To run the game, use the command line in the project directory and run the command `node server`. This will start the server and wait for connections to be made from a browser. Use your favorite internet browser and connect to http://localhost:8080. This should display the green client page and you should be able to play the game.

I like to use Firefox, but don't limit yourself to only using one browser. The game should work on all browsers, so feel free to use whatever you want. The goal is to have this work on mobile devices, too.

There is an optional command-line switch that can be used to run a "cover all" test on the game. On your command line, type `node server --test`. This will create a testUser that starts at the very beginning of the game and execute in sequence the commands listed in `script.txt`. The server will run through the commands and print out a lot of text to demonstrate the results of each. Since there is so much, you might instead want to use `node server --test > log.txt`. This will write all of the output to a file called `log.txt` that you can then open and read in a text editor.

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
