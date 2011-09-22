#lang racket

(provide
 make-room-desc
 room
 room-name
 room-descrip
 room-exits
 get-room-exit-id)

(struct room (name descrip exits))

;; this sucks, because there is way more data that we need still
(define rooms (list (room "Welcome" 
"Welcome to Philly MUD. There are a few things you can do here. Mostly, you can walk around. When you see a room description (like this one), there is a section at the bottom labelled EXITS. Just type the direction that it says a certain room is from you and you will go there. Be careful, directions aren't necessarily two-way; you could fall in a pit!

There are other people here. You won't see any of them if you don't walk around, but if you type \"say\" (without the quotes) you can then type whatever you want and it will be announced to everyone else on the server. There's no way currently to tell a person something in private, so make sure you aren't sharing anything you wish to remain a secret.

Other than that, I haven't implemented anything else yet. So, when you get bored, just type \"quit\" and you'll be disconnected. I would prefer it if you did that rather than hard-quitting out of your telnet client; it could potentially cause an error on the server that I haven't  yet figured out how to fix.

So, there you go. Once you exit here you won't get back. Later." '(("leave" . 1)))
                    (room "Hive76" 
"This is the main hall of Hive76. From here, you can see the great statues comemorating glorious battles fought against the great machines of the past. The disabled hulk of a Stratasys FDM 2000 stands in the corner, no longer echoing its banshee cry. In its shadow lies, an Epson 7600, mostly-but-not dead. A soft din of sounds from a long-dead era announce the presence of Midway Spy Hunter. Around the corner, the deceptively small MakerBot Cupcake CNC. All valiant foes. All vanquished at the hands of the Members of the Hive.

Oh yeah, there's a bunch of ATmega8 litering the floor. Jack must have been here." '(("north" . 2) ("south" . 3)))
                    (room "Hall" 
"This is a hall. It's like many halls. It has doors that lead to other rooms. But most of those doors are locked. Don't you wish you could see what's inside?" '(("south" . 1) ("west" . 4)))
                    (room "The Great Banquet Hall" 
"Haha, right. There's no banquet hall here. Try going to Popeye's up the street." '(("north" . 1)))
                    (room "Elevator, 5th floor" 
"This elevator looks like the one in Diamonds Are Forever, where an assassin tries to kill James Bond, but James Bond manages to fight him off and stab him to death with a piece of broken glass. James then swaps his identity with the dead man. A woman finds them and searches the body to fall victim to James' ruse, believing he has just killed Mr. Bond, who is apparently the most famous secret spy in the entire world.

This didn't happen here, it was just an awesome scene, so I thought I would share." '(("east" . 2) ("down" . 5)))
                    (room "Elevator, 4th floor" 
"There is no point in getting off here. The door to this floor is locked" '(("up" . 4) ("down" . 6)))
                    (room "Elevator, 3rd floor"
"There is no point in getting off here. The door to this floor is also locked" '(("up" . 5) ("down" . 7)))
                    (room "Elevator, 2nd floor"
"There is no... yeah, you get the point by now" '(("up" . 6) ("down" . 8)))
                    (room "Elevator, 1st floor"
"You are on the ground floor, in the Elevator. You can't go further in to the building, as the door is locked, but you can go outside to the wonderful, magical world of Philadelphia!" '(("up" . 7) ("west" . 9)))
                    (room "Outside Hive76"
"The sweet smell of paper, tumbleweeding through the street, wafts to your nose. Nope, wait, that's a hobo. Definitely hobo poop." '(("east" . 8)))))


;; returns an index into the rooms list on success, -1 on failure.
(define (get-room-exit-id id dir)
  (or (and (id . < . (length rooms))
           (let ([exits (assoc dir (room-exits (list-ref rooms id)))])
             (and (cons? exits)
                  (cdr exits))))
      -1))  

(define (make-exits named-ids)
  (apply string-append (map (λ (named-id)
                              (let* ([dir-name (car named-id)]
                                     [room-id (cdr named-id)]
                                     [room (list-ref rooms room-id)])
                                (format "\t~a: ~a\r\n" dir-name (room-name room))))
                            named-ids)))

(define (make-people-list client-names)
  (apply string-append (map (λ (client-name) 
                              (format "\t~a\r\n" client-name))
                            client-names)))

(define (make-room-desc id client-names)
  (when (id . < . (length rooms))
    (define room (list-ref rooms id))
    (when (room? room)
      (format "
-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-\r
ROOM: ~a\r

~a\r

PEOPLE HERE:\r
~a\r
EXITS:\r
~a"
              (room-name room)
              (room-descrip room)
              (make-people-list client-names)
              (make-exits (room-exits room))))))