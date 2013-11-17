#lang racket
(struct exit (name id key lock-msg) #:transparent)
(struct item (name descrip) #:transparent)
(struct room (name descrip items exits) #:transparent)

(define (item-description itm)
  (format "~n\t~a - ~a" 
          (item-name itm) 
          (item-descrip itm)))

(define (exit-description x)
  (let* ([f (format "~a.room" (exit-id x))]
         [exists (file-exists? f)]
         [extra (if exists "" " (UNDER CONSTRUCTION)")])
    (format "~n\t~a~a" 
            (exit-name x) 
            extra)))

(define (name-list f lst)
  (let* ([strs (and lst (map f lst))])
    (or (and strs (string-join strs)) "\n\tnone")))

(define (format-room rm)
  (format "ROOM: ~a

~a

ITEMS:~a

EXITS:~a" 
          (room-name rm) 
          (room-descrip rm)
          (name-list item-description (room-items rm))
          (name-list exit-description (room-exits rm))))

(define (read-room id)
  (let ([filename (string-append (symbol->string id) ".room")])
    (with-input-from-file filename
      (λ ()
        (eval (read))))))

(define (write-room id rm)
  (let ([filename (string-append (symbol->string id) ".room")])
    (with-output-to-file
        filename
      (λ () (print rm))
      #:mode 'text
      #:exists 'replace)))

(define (show-room id)
  (display (format-room (read-room id))))

(define current-location 'test)
(define current-items '())

(define (look)
  (show-room current-location))

(define (move dir)
  (let* ([rm (read-room current-location)]
         [exits (room-exits rm)]
         [xs (and exits (memf (λ (y) (eq? (exit-name y) dir)) exits))]
         [x (and xs (car xs))]
         [exists (and x (file-exists? (format "~a.room" (exit-id x))))]
         [key (and exists (exit-key x))]
         [good (or (not key) (and key (member key current-items)))])
    (if good
        (begin (set! current-location (exit-id x)) (look))
        (if key
            (display (exit-lock-msg x))
            (display "You can't go that way")))))

(define (north) (move 'north))
(define (east) (move 'east))
(define (south) (move 'south))
(define (west) (move 'west))

(define (take itm)
  (let* ([rm (read-room current-location)]
         [items (room-items rm)]
         [is (and items (memf (λ (y) (eq? (item-name y) itm)) items))]
         [i (and is (car is))])
    (if i 
        (set! current-items (cons itm current-items))
        (display "there is nothing here like that"))))

(write-room 'test (room "a test room"
                        "There is not a lot to see here.
This is just a test room.
It's meant for testing.
Nothing more.
Goodbye."
                        (list (item 'sword "a rusty sword")
                              (item 'bird "definitely a bird")
                              (item 'rock "definitely not a bird")
                              (item 'garbage "some junk"))
                        (list (exit 'north 'test2 #f #f)
                              (exit 'east 'test3 #f #f)
                              (exit 'south 'test4 'bird "don't forget the bird"))))


(write-room 'test2 (room "another test room"
                         "Keep moving along"
                         #f
                         (list (exit 'south 'test #f #f))))

(write-room 'test3 (room "a loop room"
                         "it's probably going to work"
                         #f
                         (list (exit 'south 'test5 #f #f))))

(write-room 'test4 (room "locked room"
                         "This room was locked with the bird"
                         #f
                         (list (exit 'north 'test #f #f))))

(write-room 'test5 (room "a loop room, 2"
                         "it's probably going to work"
                         #f
                         (list (exit 'west 'test4 #f #f))))