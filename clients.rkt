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
;; Prompts a newly connected user for their name
(define (connect-new-client listener clients)
  (display "accepting new connection\n")
  (define-values (in out) (tcp-accept listener))
  (send ;; welcome message
   "Welcome to a very simple, Multi-User Dungeon that I have created. This MUD is almost completely useless at this time. However, you can run around in\r
the few rooms that exist and try to get a feel for things! So, without further ado...\r

ENTER YOUR NAME, MOTHERFUCKER: " out)
  (let* ([input (read-line in)]
         [name (if (eof-object? input) #f (trim-name input))] ;; try to parse the name, or fail if the user disconnected
         [new-client (if name (client in out name 0) #f)]) ;; create the user with their name, or fail
    (if new-client
        (begin
          (process new-client "view" clients) ;; show the user where they are
          new-client) ;; return the user to the managing thread
        #f))) ;; or fail

;; Checks to see if there are any new connection attempts and
;; creates a new client object for them.
(define (accept-new-clients clients listener)
  (if (tcp-accept-ready? listener)
      (let ([new-user (connect-new-client listener clients)])
        (if new-user
            (cons new-user clients)
            clients))
      clients))

;; looks for any closed client connections--closed either because the user
;; disconnected or the server forcefully shut them off--and removes them
;; from the list of clients.
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

;; Forcefully close a client connection
(define (close-client client)
  (display (format "Closing client: ~a\n" (client-name client)))
  (close-input-port (client-in client))
  (close-output-port (client-out client)))

;; Kill everyone
(define (close-all-clients clients)
  (when (cons? clients)
    (close-client (first clients))
    (close-all-clients (rest clients))))


(define (process client line clients)
  (let* ([parts (regexp-split #rx" " line)]
         [command (first parts)]
         [func (assoc command commands)]
         [result (if func 
                     ((cdr func) client (rest parts) clients) 
                     #f)])
    (unless func (send "I don't understand what you mean\r\n" (client-out client)))
    (print-prompt client)
    result))

(define (send msg out)
  (unless (port-closed? out)
    (display msg out)
    (flush-output out)))

(define (print-prompt client)    
  (send (format "~a :> " (client-name client)) (client-out client)))

(define (process-all-clients clients)
  (define msg-queue (filter-map (λ (client) (do-client-input client clients)) 
                                clients))
  (when (cons? msg-queue)
    (for ([client clients])
      (do-client-output client msg-queue))))

(define (do-client-input client clients)
  (cond [(char-ready? (client-in client))
         (define line (read-line (client-in client)))
         (display (format "INCOMING! ~a [~a]\n" (client-name client) line))
         (cond [(eof-object? line)
                (close-client client)
                #f]
               [else 
                (let ([trimmed-line (substring line 0 (sub1 (string-length line)))])
                  (process client trimmed-line clients))])]
        [else #f]))

(define (do-client-output client msg-queue)
  (when (cons? msg-queue)
    (define out (client-out client))
    (send "\r\n" out)
    (let _msg-send ([msgs msg-queue])
      (when (cons? msgs)
        (send (first msgs) out)
        (_msg-send (rest msgs))))
    (print-prompt client)))

(define (cmd-view client parts clients)
  (define room-id (client-current-room-id client))
  (define also-here (map client-name (filter (λ (c) (= room-id (client-current-room-id c))) clients)))
  (send (make-room-desc room-id also-here) (client-out client))
  #f)

(define (cmd-move client parts clients)
  (define out (client-out client))
  (cond [(= 1 (length parts))
         (let* ([room-id (client-current-room-id client)]
                [dir (first parts)]
                [new-room-id (get-room-exit-id room-id dir)])
           (cond [(new-room-id . > . -1)
                  (set-client-current-room-id! client new-room-id)
                  (cmd-view client parts clients)]
                 [else
                  (send "You can't go that direction\r\n" (client-out client))]))]
        [else
         (send "Please provide 1 and only 1 move direction\r\n" out)])
  #f)

(define (alias-move dir)
  (cons dir (λ (client parts clients)
              (cmd-move client (cons dir parts) clients))))

(define (cmd-quit client parts clients)
  (send "Goodbye!\r\n" (client-out client))
  (close-client client)
  (format "~a has quit.\r\n" (client-name client)))

(define (cmd-bad-word client parts clients)
  (send "Hey now, that was a bad word. Only I'm allowed to cuss here.\r\n" (client-out client))
  #f)

(define (cmd-say client parts clients)
  (cond [(cons? parts)
         (format "[~a]: \"~a\"\r\n" (client-name client) (string-join parts " "))]
        [else
         (send "You have to say something to be heard\r\n" (client-out client))
         #f]))

(define commands (list (cons "view" cmd-view)
                       (cons "move" cmd-move)
                       (alias-move "north")
                       (alias-move "east")
                       (alias-move "south")
                       (alias-move "west")
                       (alias-move "up")
                       (alias-move "down")
                       (alias-move "in")
                       (alias-move "out")
                       (cons "exit" cmd-quit)
                       (cons "quit" cmd-quit)
                       (cons "say" cmd-say)
                       (cons "fuck" cmd-bad-word)
                       (cons "shit" cmd-bad-word)
                       (cons "damn" cmd-bad-word)
                       (cons "dammit" cmd-bad-word)
                       (cons "damnit" cmd-bad-word)))