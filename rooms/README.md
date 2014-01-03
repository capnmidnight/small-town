Room definitions
================

Any file with the `.room` extension is a room, and it's file name minus the extension is the room's ID. You will refer to the room by this room-id when specifying exits to the room from other rooms. Because of this, do not use any spaces in the filename of the room.

The room file has two optional sections for `exits` and `items`. These sections have their own formats that define attributes of the room. The sections may be defined in any order, but they must appear before the room description. Each section is terminated by a new line character. 

After the three sections, the room description is listed. The room description has no format. It will be displayed to the user as you have it defined in the file. The room description must come last in the file, because as soon as the program detects that it is not parsing one of the three header sections, it assumes the rest of the file is the description.

Example
=======
````
exits
    south to Main-Square
	north to Hidden-Room cloaked with mystical-jewel
	east to Armory locked with armory-key "The way is locked."
	west to East-Gate locked when 3600
	enter to Guard-Shack with shack-key, guard-crest "Only guards are allowed in the guard shack."
	-down to Sewer
	-up to Heaven cloaked when 3600, 0.25

items
    red-flower 10
    blue-flower 5

Text for the room. This is the room description. Blah blah blah blah.
Type whatever you want.
It all gets read verbatim.
````

Items
=====
The items section is the easiest to define. It is simply a list of items and item counts. The items must be listed in the `data/items.txt` file. If only one of an item is required, then the item count may be ommitted.

Exits
=====
The exit format is the more complex of the two header formats. It has a lot of different parts.

* `-` (optional): a hyphen at the begining of an exit line indicates that the exit is a one-way path. Otherwise, all exits are bi-directional by default. When defining an exit from `Room-A` to `Room-B` as a bi-directional exit, it is an error to define the opposing exit from `Room-B` to `Room-A`.
* exit-name (required): the valid exit names are `north`, `south`, `east`, `west`, `up`, `down`, `exit`, `enter`, and `leave`. Bi-directional rooms automatically choose the opposite (e.g. `south` for `north`) direction when creating the reverse exit. In other words, defining in `Room-A` an exit `north to Room-B` automatically creates an exit in `Room-B` called `south to Room-A`. The only exit-name that does not have a reverse name is `leave`.
* `to` (required): indicates the next piece of text is the room to which the exit leads.
* room-id (required): the room to which the exit leads. Room IDs are the room definition filenames, minus the `.room` extension
* `locked` (optional): indicates the following text defines a lock for the exit. Locks have certain conditions that must be met before a user is allowed through them. See the section `Locks and Cloaks` for more details.
* `cloaked` (optional): indicates the following text defines a cloak for the exit. Cloaks have certain conditions that must be met before a user can see (and thus, be allowed through) the exit. See the section `Locks and Cloaks` for more details.
* "lock message" (optional): A section of text in quotation marks defines a message to show to the user if they try to travel through the locked exit. There is no equivalent for cloaks.

Locks and Cloaks
================
Locks and cloaks are modifiers on exits that require the user hold certain items or certain time constraints be met before the exit is active for use for the user. The only difference between a lock and a cloak is that a locked exit is always visible to the user and a cloaked exit is only visible when the cloak requirements are met. Otherwise, they perform in the same way and are defined in the same way.

* `locked` or `cloaked` (required): the keyword defining which type of exit constraint that is being created.
* `with` (optional): begins definition of an item-based constraint. Item constraints are comma-separated lists of items that the user must hold for the constraint to be satisfied. If only one item is required, no commas are provided in the list. 
* `when` (optional): begins definition of a time-based constraint. Time constraints are comma-seperated lists of 1, 2, or 3 numbers that define a period on which the constraint is active versus inactive. The numbers, in order are `period`, `width`, and `shift`. Careful use of the `when` constraint can create highly dynamic exits that simulate revolving doors, vehicles, or puzzles.
    * period (required): the number of seconds long that the entire time constraint runs, both "on" and "off". A period of 60 will mean that the constraint is "on" for 30 seconds, followed by "off" for another 30 seconds (unless a width is defined to change the balance).
	* width (optional): the proportion of the period for which the constraint is activated versus deactivated. The default value is `0.5`, splitting the period into equal halves. With a period of `60` and a width of `0.75`, the constraint will be active for 45 seconds and inactive for 15.
	* shift (optional): the number of seconds to subtract from the current time before calculating the time constraint. The default value is `0`. The shift allows for changing the exact start time of the period. This is useful when overlapping exits that have the same period length, but need to be activated at opposing times. For example, if `exit-a` and `exit-b` both have a period of 60 seconds, and both have a width of 0.5, with no shift value they will both be active for the first 30 seconds of the period and inactive for the last 30 seconds. But if `exit-b` has a shift of 30 seconds, then when `exit-a` is active, `exit-b` will be inactive, and vice versa.