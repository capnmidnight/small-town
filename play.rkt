#lang racket
(struct exit (name room-id key lock-msg) #:transparent)
(struct item (name descrip count) #:transparent #:mutable)
(struct room (name descrip items exits) #:transparent #:mutable)
(struct body (name location items pc?) #:transparent #:mutable)

(define (item-description itm)
  (format "~n\t~a ~a - ~a"
          (item-count itm)
          (item-name itm) 
          (item-descrip itm)))

(define (room-filename x)
  (format "~a.room" (exit-room-id x)))

(define (room-full-items rm)
  (let ([items (room-items rm)])
    (and items 
         (filter (compose positive? item-count) 
                 items))))

(define (exit-description x)
  (let* ([filename (room-filename x)]
         [exists (file-exists? filename)]
         [extra (if exists "" " (UNDER CONSTRUCTION)")])
    (format "~n\t~a~a" 
            (exit-name x) 
            extra)))

(define (list-descriptions f lst)
  (let ([strs (and lst (map f lst))])
    (or (and strs (string-join strs)) "\n\tnone")))

(define (room-description rm)
  (format "ROOM: ~a

~a

ITEMS:~a

EXITS:~a" 
          (room-name rm) 
          (room-descrip rm)
          (list-descriptions item-description (room-full-items rm))
          (list-descriptions exit-description (room-exits rm))))

(define current-rooms (make-hash))

(define (read-room id)
  (hash-ref! current-rooms id
             (λ ()
               (let ([filename (string-append (symbol->string id) ".room")])
                 (with-input-from-file filename
                   (λ ()
                     (eval (read))))))))



(define (with-room rm-id thunk)
  (let* ([filename (string-append (symbol->string rm-id) ".room")]
         [exists (file-exists? filename)]
         [rm (and exists (read-room rm-id))])
    (if rm
        (thunk rm)
        (displayln (format "Room \"~a\" doesn't exist" rm-id)))))

(define (write-room id rm)
  (let ([filename (string-append (symbol->string id) ".room")])
    (with-output-to-file
        filename
      (λ () (print rm))
      #:mode 'text
      #:exists 'replace)))

(define (show-room id)
  (with-room id (λ (rm) (displayln (room-description rm)))))

(define current-location 'test)
(define current-items '())
(define current-cmds '(quit look take north south east west))
(define done #f)

(define (quit)
  (set! done #t))

(define (look)
  (show-room current-location))

(define (move dir)
  (with-room 
   current-location
   (λ (rm)
     (let* ([exits (room-exits rm)]
            [x (and exits (findf (λ (y) (equal? (exit-name y) dir)) exits))]
            [exists (and x (file-exists? (room-filename x)))]
            [key (and exists (exit-key x))]
            [good (and x (or (not key) (and key (member key current-items))))])
       (if good
           (begin 
             (set! current-location (exit-room-id x)) 
             (look))
           (if key
               (displayln (exit-lock-msg x))
               (displayln "You can't go that way")))))))

(define (north) (move 'north))
(define (east) (move 'east))
(define (south) (move 'south))
(define (west) (move 'west))

(define (take itm)
  (with-room 
   current-location
   (λ (rm)
     (let* ([items (room-full-items rm)]
            [i (and items (findf (λ (y) (eq? (item-name y) itm)) items))])
       (if i 
           (begin
             (set-item-count! i (sub1 (item-count i)))
             (set! current-items (cons itm current-items))
             (displayln (format "You picked up the ~a" itm)))
           (displayln "there is nothing here like that"))))))

(define (do-command str)
  (let* ([parts (map string->symbol (string-split str " "))]
         [cmd (first parts)]
         [pms (rest parts)]
         [exists (member cmd current-cmds)]
         [proc (and exists (eval cmd))]
         [arg-count (or (and proc (procedure-arity proc)) 0)])
    (if exists
        (if (= (length pms) arg-count)
            (apply proc pms)
            (if (< (length pms) arg-count)
                (displayln "not enough arguments")
                (displayln "too many arguments")))
        (displayln (format "I do not understand \"~a\"." cmd)))))

(define (create-test-rooms)
  (write-room 'test (room "a test room"
                          "There is not a lot to see here.
This is just a test room.
It's meant for testing.
Nothing more.
Goodbye."
                          (list (item 'sword "a rusty sword" 1)
                                (item 'bird "definitely a bird" 1)
                                (item 'rock "definitely not a bird" 5)
                                (item 'garbage "some junk" 0))
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
                           (list (exit 'west 'test4 #f #f)))))


(define (run)
  (set! done #f)
  (let loop ([str (read-line)])
    (do-command str)
    (unless done (loop (read-line)))))