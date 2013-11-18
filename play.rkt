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

(define (item-description k v)
  (let ([i (hash-ref item-catalogue k #f)])
    (format "~n\t~a ~a - ~a"
            v
            k
            (or (and i (item-descrip i))
                "(UNKNOWN)"))))

(define (room-filename x)
  (format "~a.room" (exit-room-id x)))

(define (room-full-items rm)
  (let ([items (room-items rm)])
    (and items 
         (make-hash 
          (filter identity 
                  (hash-map items 
                            (λ (k v) 
                              (if (positive? v)
                                  (cons k v)
                                  #f))))))))

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
          (list-descriptions item-description (room-full-items rm))
          (list-descriptions exit-description (room-exits rm))))

(define current-rooms (make-hash))

(define (make-room)
  (let* ([rm (eval (read))]
         [itms (room-items rm)]
         [mitms (and itms (make-hash (hash->list itms)))])
    (set-room-items! rm mitms)
    rm))

(define (read-room id)
  (hash-ref! current-rooms id
             (λ ()
               (let ([filename (string-append (symbol->string id) ".room")])
                 (with-input-from-file filename make-room)))))



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

(define current-location 'test)
(define current-items '())
(define current-cmds '(quit look take north south east west))
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
         [good (and x (or (not key) (and key (member key current-items))))])
    (if good
        (begin 
          (set! current-location (exit-room-id x)) 
          (look))
        (if key
            (displayln (exit-lock-msg x))
            (displayln "You can't go that way")))))

(define (north rm) (move rm 'north))
(define (east rm) (move rm 'east))
(define (south rm) (move rm 'south))
(define (west rm) (move rm 'west))

(define (take rm itm)
  (let* ([items (room-full-items rm)]
         [i (and items (hash-ref items itm #f))])
    (if i 
        (begin
          (hash-update! (room-items rm) itm sub1)
          (set! current-items (cons itm current-items))
          (displayln (format "You picked up the ~a" itm)))
        (displayln (format "there is no \"~a\" here" itm)))))

(define (do-command rm str)
  (let* ([parts (map string->symbol (string-split str " "))]
         [cmd (first parts)]
         [pms (rest parts)]
         [exists (member cmd current-cmds)]
         [proc (and exists (eval cmd))]
         [arg-count (or (and proc (sub1 (procedure-arity proc))) 0)])
    (if exists
        (if (= (length pms) arg-count)
            (apply proc pms)
            (if (< (length pms) arg-count)
                (displayln "not enough arguments")
                (displayln "too many arguments")))
        (displayln (format "I do not understand \"~a\"." cmd)))))

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


(define (run)
  (set! done #f)
  (with-room current-location look)
  (let loop ([str (read-line)])
    (with-room current-location 
               (curry do-command (string-downcase str)))
    (unless done (loop (read-line)))))

(define (test)
  (with-room 
   current-location
   (λ (rm)
     (look rm)
     (take rm 'something)
     (take rm 'garbage)
     (take rm 'orb)
     (take rm 'hidden)
     (north rm)
     (south rm)
     (west rm)
     (south rm)
     (take rm 'bird)
     (look rm)
     (south rm))))