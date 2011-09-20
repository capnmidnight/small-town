#lang racket

(require "rooms.rkt")

(provide
 process-all-clients
 accept-new-clients
 remove-old-clients
 close-all-clients)

;; Every person connected to the server ends up in one of these.
;; Right now, does not prevent multiple users from having this
;; same name. This isn't an issue since users aren't addressable,
;; but will eventually be a problem.
(struct client (in 
                out 
                name 
                [current-room-id #:mutable]))

;; This function is garbage. I can't figure out what the junk
;; is that PuTTy sends to the server on connection, so I'm just
;; substringing it away.
(define (trim-name name)
  (if (> (string-length name) 21)
      (substring name 21 (sub1 (string-length name)))
      #f))

;; Checks to see if there are any new connection attempts and
;; creates a new client object for them.
(define (connect-new-client listener)
  (display "accepting new connection\n")
  (define-values (in out) (tcp-accept listener))
  (display ;; welcome message
   "Welcome to a very simple, Multi-User Dungeon that I have created. This MUD
is almost completely useless at this time. However, you can run around in
the few rooms that exist and try to get a feel for things! So, without further
ado...

ENTER YOUR NAME, MOTHERFUCKER: " out)
  (flush-output out)
  (let* ([input (read-line in)]
         [name (if (eof-object? input) #f (trim-name input))] ;; try to parse the name, or fail if the user disconnected
         [new-client (if name (client in out name 0) #f)]) ;; create the user with their name, or fail
    (if new-client
        (begin
          (cmd-view new-client empty) ;; show the new user where they are
          (print-prompt new-client) ;; give them the :> prompt
          new-client) ;; return the user to the managing thread
        #f))) ;; or fail

(define (accept-new-clients clients listener)
  (if (tcp-accept-ready? listener)
      (let ([new-user (connect-new-client listener)])
        (if new-user
            (cons new-user clients)
            client))
      clients))

(define (remove-old-clients clients)
  (let _remove ([good empty]
                [left clients])
    (if (cons? left)
        (let* ([client (first left)]
               [in (client-in client)]
               [out (client-out client)])
          (if (or (port-closed? in)
                  (port-closed? out))
              (_remove good (rest left))
              (_remove (cons client good) (rest left))))
        good)))

(define (close-client client)
  (display (format "Closing client: ~a\n" (client-name client)))
  (close-input-port (client-in client))
  (close-output-port (client-out client)))

(define (close-all-clients clients)
  (when (cons? clients)
    (close-client (first clients))
    (close-all-clients (rest clients))))

(define (process client line)
  (let* ([parts (regexp-split #rx" " line)]
         [command (first parts)]
         [func (assoc command commands)]
         [out (client-out client)])
    (if func
        ((cdr func) client (rest parts))
        (display "I don't understand what you mean\r\n" out))
    (unless (port-closed? out) (print-prompt client))))

(define (do-client-input client)
  (when (char-ready? (client-in client))
    (define line (read-line (client-in client)))
    (display (format "INCOMING! ~a [~a]\n" (client-name client) line))
    (newline)
    (if (eof-object? line)
        (close-client client)
        (process client (substring line 0 (sub1 (string-length line)))))))

(define (do-client-output client)
  (define out (client-out client))
  (when (and (cons? msg-queue)
             (not (port-closed? out)))
    (display "\r\n" out)
    (let _send ([msgs msg-queue])
      (when (cons? _send)
        (display (first msgs) (client-out client))
        (_send (rest msgs))))
    (print-prompt client)))

(define (print-prompt client)    
  (display (format "~a :> " (client-name client)) (client-out client)))

(define (process-all-clients clients)
  (if (cons? clients)
      (let* ([client (first clients)]
             [out (client-out client)])
        (do-client-input client)
        (do-client-output client)
        (unless (port-closed? out) (flush-output out))
        (process-all-clients (rest clients)))
      (set! msg-queue empty)))

(define (cmd-view client parts)
  (display (make-room-desc (client-current-room-id client)) (client-out client)))

(define (cmd-move client parts)
  (define out (client-out client))
  (cond
    [(= 1 (length parts))
     (let* ([room-id (client-current-room-id client)]
            [dir (first parts)]
            [new-room-id (get-room-exit-id room-id dir)])
       (cond
         [(new-room-id . > . -1)
          (set-client-current-room-id! client new-room-id)
          (cmd-view client parts)]
         [else
          (display "You can't go that direction\r\n" (client-out client))]))]
    [else
     (display "Please provide 1 and only 1 move direction\r\n" out)]))


(define (cmd-quit client parts)
  (display "Goodbye!\r\n" (client-out client))
  (flush-output (client-out client))
  (close-client client))

(define (cmd-bad-word client parts)
  (display "Hey now, that was a bad word. Only I'm allowed to cuss here.\r\n" (client-out client)))

(define msg-queue empty)

(define (cmd-say client parts)
  (if (cons? parts)
      (set! msg-queue (cons (format "MSG [~a]: ~a" (client-name client) (string-join parts " ")) msg-queue))
      (display "You have to say something to be heard\r\n" (client-out client))))

(define commands (list (cons "view" cmd-view)
                       (cons "move" cmd-move)
                       (cons "north" (λ (client parts) (cmd-move client (cons "north" parts))))
                       (cons "east" (λ (client parts) (cmd-move client (cons "east" parts))))
                       (cons "south" (λ (client parts) (cmd-move client (cons "south" parts))))
                       (cons "west" (λ (client parts) (cmd-move client (cons "west" parts))))
                       (cons "up" (λ (client parts) (cmd-move client (cons "up" parts))))
                       (cons "down" (λ (client parts) (cmd-move client (cons "down" parts))))
                       (cons "in" (λ (client parts) (cmd-move client (cons "in" parts))))
                       (cons "out" (λ (client parts) (cmd-move client (cons "out" parts))))
                       (cons "quit" cmd-quit)
                       (cons "say" cmd-say)
                       (cons "fuck" cmd-bad-word)
                       (cons "shit" cmd-bad-word)
                       (cons "damn" cmd-bad-word)
                       (cons "dammit" cmd-bad-word)
                       (cons "damnit" cmd-bad-word)))