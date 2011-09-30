#lang racket

(require "client.rkt"
         "util.rkt"
         "rooms.rkt")

(provide dispatchers)

(define ((cmd-view parts) client clients)
  (define room-id (client-current-room-id client))
  (when (cons? clients)
    (define also-here 
      (for/list ([c clients]
                 #:when (= room-id (client-current-room-id c)))
        (client-name c)))
    (send (make-room-desc room-id also-here) (client-out client)))
  client)

(define ((cmd-move parts) client clients)
  (define out (client-out client))
  (cond [(= 2 (length parts))
         (let* ([room-id (client-current-room-id client)]
                [dir (string-downcase (second parts))]
                [new-room-id (get-room-exit-id room-id dir)])
           (cond [new-room-id
                  ((cmd-view parts) (move-room client new-room-id) clients)]
                 [else
                  (send "You can't go that direction" out)
                  client]))]
        [else
         (send "Please provide 1 and only 1 move direction" out)
         client]))

(define (alias-move dir)
  (λ (parts) (cmd-move (cons dir parts))))

(define ((cmd-quit parts) client clients)
  (for ([c clients])
    (send (format "~a has quit." (client-name client)) (client-out c)))
  (close-client client)
  #f)

(define ((cmd-say parts) client clients)
  (define msg (rest parts))
  (cond [(cons? msg)
         (for ([c clients])
           (send (format "[~a]: \"~a\"" 
                         (client-name client) 
                         (string-join msg " ")) 
                 (client-out c)))]
        [else
         (send "You have to say something to be heard" (client-out client))])
  client)

(define ((cmd-shutdown-server parts) client clients)
  (raise "KILL KILL KILL KILL"))

(define ((cmd-name input) client clients)
  (cond [(equal? "new" input)
         (change-state client 'setup)]
        [(findf (λ (c) (equal? (client-name c) input)) clients)
         (send "That name is already taken" (client-out client))
         client]
        [else
         (define new-user (change-state (change-name client input) 'ready))
         ((cmd-view empty) new-user clients)
         new-user]))

(define standard-commands 
  (hash "view" cmd-view
        "look" cmd-view
        "move" cmd-move
        "north" (alias-move "north")
        "east" (alias-move "east")
        "south" (alias-move "south")
        "west" (alias-move "west")
        "up" (alias-move "up")
        "down" (alias-move "down")
        "in" (alias-move "in")
        "out" (alias-move "out")
        "leave" (alias-move "leave")
        "exit" cmd-quit
        "quit" cmd-quit
        "say" cmd-say
        "XXX_SHUTDOWN_XXX" cmd-shutdown-server))

(define (standard-dispatcher input)
  (let* ([parts (regexp-split #rx" " input)]
         [command (first parts)]
         [proc (hash-ref standard-commands command #f)])
    (and proc (proc parts))))

(define dispatchers
  (hash
   'connected (λ (input) (cmd-name input))
   'setup (λ (input) #f)
   'ready standard-dispatcher))