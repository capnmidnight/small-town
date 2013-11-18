#lang racket
(struct exit (room-id key lock-msg) #:transparent)
(struct item (descrip) #:transparent)
(struct room (descrip items exits) #:transparent #:mutable)
(struct body (name location items pc?) #:transparent #:mutable)

(define item-catalogue
  (hash 'sword (item "a rusty sword")
        'bird (item "definitely a bird")
        'rock (item "definitely not a bird")
        'garbage (item "some junk")))

(define (room-item-description k v)
  (let* ([i (hash-ref item-catalogue k #f)]
         [desc (or 
                (and i (item-descrip i))
                "(UNKNOWN)")])
    (format "~n\t~a ~a - ~a" v k desc)))

(define (room-filename x)
  (format "~a.room" (exit-room-id x)))

(define (exit-description k v)
  (let* ([filename (and v (room-filename v))]
         [exists (and filename (file-exists? filename))]
         [extra (if exists "" " (UNDER CONSTRUCTION)")])
    (format "~n\t~a~a" 
            k
            extra)))

(define (list-descriptions f lst)
  (let ([strs (and lst (hash-map lst f))])
    (or (and strs (string-join strs)) "\n\tnone")))

(define (room-description rm)
  (format "ROOM: ~a

ITEMS:~a

EXITS:~a" 
          (room-descrip rm)
          (list-descriptions room-item-description (room-items rm))
          (list-descriptions exit-description (room-exits rm))))

(define (prepare-room)
  (let* ([rm (eval (read))]
         [itms (room-items rm)]
         [non-zero (and itms (filter (compose positive? cdr) (hash->list itms)))]
         [mitms (and non-zero (make-hash non-zero))])
    (set-room-items! rm (or mitms (make-hash)))
    rm))

(define (read-room id)
  (let ([filename (string-append (symbol->string id) ".room")])
    (with-input-from-file filename prepare-room)))

(define (get-room id)
  (hash-ref! current-rooms id (curry read-room id)))

(define (with-room rm-id thunk)
  (let* ([filename (string-append (symbol->string rm-id) ".room")]
         [exists (file-exists? filename)]
         [rm (and exists (get-room rm-id))])
    (if rm
        (thunk rm)
        (displayln (format "Room \"~a\" doesn't exist" rm-id)))))

(define (write-room id rm)
  (let ([filename (string-append (symbol->string id) ".room")])
    (with-output-to-file
        filename
      (curry print rm)
      #:mode 'text
      #:exists 'replace)))

(define current-location 'test)
(define current-items (make-hash))
(define current-rooms (make-hash))
(define current-cmds '(quit look take drop north south east west))
(define done #f)

(define (quit rm)
  (set! done #t))

(define (look rm)
  (displayln (room-description rm)))

(define (move rm dir)
  (let* ([exits (room-exits rm)]
         [x (and exits (hash-ref exits dir #f))]
         [exists (and x (file-exists? (room-filename x)))]
         [key (and exists (exit-key x))]
         [good (and x (or (not key) (and key (hash-ref current-items key #f))))])
    (if good
        (set! current-location (exit-room-id x)) 
        (if key
            (displayln (exit-lock-msg x))
            (displayln "You can't go that way")))))

(define (north rm) (move rm 'north))
(define (east rm) (move rm 'east))
(define (south rm) (move rm 'south))
(define (west rm) (move rm 'west))

(define (move-item itm from to act-name loc-name)
  (if (hash-ref from itm #f)
      (begin
        (hash-update! from itm sub1)
        (when (= 0 (hash-ref from itm))
          (hash-remove! from itm))
        (hash-update! to itm add1 0)
        (displayln (format "You ~a the ~a" act-name itm)))
      (displayln (format "There is no ~a ~a" itm loc-name))))

(define (take rm itm)
  (move-item itm 
             (room-items rm)
             current-items
             "picked up"
             "here"))

(define (drop rm itm)
   (move-item itm
              current-items
              (room-items rm)
              "dropped"
              "in your inventory"))

(define (do-command rm str)
  (when (positive? (string-length str))
    (let* ([tokens (map string->symbol (string-split str " "))]
           [params (rest tokens)]
           [cmd (first tokens)]
           [exists (and cmd (member cmd current-cmds))]
           [proc (and exists (eval cmd))]
           [arg-count (or (and proc (sub1 (procedure-arity proc))) 0)])
      (if exists
          (if (= (length params) arg-count)
              (apply proc (cons rm params))
              (if (< (length params) arg-count)
                  (displayln "not enough parameters")
                  (displayln "too many parameters")))
          (displayln (format "I do not understand \"~a\"." cmd))))))


(define (run)
  (set! done #f)
  (with-room current-location look)
  (let loop ([str (read-line)])
    (with-room current-location 
               (curryr do-command (string-downcase str)))
    (unless done (loop (read-line)))))

(define (create-test-rooms)
  (write-room 'test (room "a test room

There is not a lot to see here.
This is just a test room.
It's meant for testing.
Nothing more.
Goodbye."
                          (hash 'sword 1
                                'bird 1
                                'rock 5
                                'garbage 0
                                'orb 1
                                'hidden 0)
                          (hash 'north (exit 'test2 #f #f)
                                'east (exit 'test3 #f #f)
                                'south (exit 'test4 'bird "don't forget the bird")
                                'west #f)))
  
  (write-room 'test2 (room "another test room

Keep moving along"
                           #f
                           (hash 'south (exit 'test #f #f))))
  
  (write-room 'test3 (room "a loop room

it's probably going to work"
                           #f
                           (hash 'south (exit 'test5 #f #f))))
  
  (write-room 'test4 (room "locked room

This room was locked with the bird"
                           #f
                           (hash 'north (exit 'test #f #f))))
  
  (write-room 'test5 (room "a loop room, 2

it's probably going to work"
                           #f
                           (hash 'west (exit 'test4 #f #f)))))

(define (test)
  (let-values ([(in out) (make-pipe)])
    (parameterize ([current-input-port in])
      (displayln "
look
take something
take garbage
take orb
take hidden
look
north
look
south
look
west
look
south
look
take bird
look
south
look
drop orb
look
quit" out)
      (run))))