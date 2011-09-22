#lang racket

(require "rooms.rkt")

(provide
 server-cycle
 close-all-clients
 DEBUG)

(define (DEBUG . str)
  (when #t 
    (let _x ([p str])
      (when (cons? p)
        (display (first p))
        (when (cons? (rest p))
          (display ": "))
        (_x (rest p))))
    (newline)))

;; Every person connected to the server ends up in one of these.
;; Right now, does not prevent multiple users from having this
;; same name. This isn't an issue since users aren't addressable,
;; but will eventually be a problem.
(struct client (in 
                out 
                [name #:mutable]
                [current-room-id #:mutable])
        #:transparent)

(define (server-cycle clients listener)
  ; (sleep 1)
  (process-all-clients clients)
  (remove-old-clients (accept-new-clients clients listener)))

(define (send msg out)
  (unless (port-closed? out)
    (display msg out)
    (flush-output out)))

(define (recv in)
  (unless (port-closed? in)
    (DEBUG "recv" "reading...")
    (define line (read-line in 'any))
    (DEBUG "recv" line)
    line))

(define (print-prompt client)
  (send (string-append (client-name client) " :> ") (client-out client)))

;; Prompts a newly connected user for their name
(define (connect-new-client listener)
  (DEBUG "connect-new-client" "accepting new connection")
  (define-values (in out) (tcp-accept listener))
  (send #"\e[1;36m" out)
  (send (regexp-replace* #rx"\n" (regexp-replace* #rx"\r\n" (call-with-input-file* "welcome.txt" port->string) "\n") "\r\n") out) ;; this little rigamorole is to correct for the bullshit newline situation between OS X and everybody else
  (send #"\e[0m" out)
  (let* ([input (read-line in 'any)]
         [name (and (not (eof-object? input)) input)] ;; fail if the user disconnected
         [new-client (and name (client in out name 0))]) ;; create the user with their name, or fail
    (DEBUG "connect-new-client" "input" input)
    (DEBUG "connect-new-client" "name recognized" name)
    (DEBUG "connect-new-client" new-client)
    (unless new-client (close-client (client in out #f 0)))
    new-client)) ;; will return #f if the user was not initialized properly

;; Checks to see if there are any new connection attempts and
;; creates a new client object for them.
(define (accept-new-clients clients listener)
  (if (tcp-accept-ready? listener)
      (let* ([new-user (connect-new-client listener)]
             [new-clients-list (if new-user (cons new-user clients) clients)])
        (when new-user (process new-user "view" new-clients-list))
        new-clients-list)
      clients))

;; looks for any closed client connections--closed either because the user
;; disconnected or the server forcefully shut them off--and removes them
;; from the list of clients.
(define (remove-old-clients clients)
  (filter (λ (client) (and (not (port-closed? (client-in client)))
                           (not (port-closed? (client-out client)))
                           client))
          clients))

;; Forcefully close a client connection
(define (close-client client)
  (DEBUG "close-client" client)
  (define name (client-name client))
  (when name (DEBUG "close-client" name))
  (close-input-port (client-in client))
  (close-output-port (client-out client)))

;; Kill everyone
(define (close-all-clients clients)
  (when (cons? clients)
    (for ([client clients])
      (close-client client))))

(define (process client line clients)
  (DEBUG "process" "client" client)
  (DEBUG "process" "line" line)
  (let* ([parts (regexp-split #rx" " line)]
         [command (string-downcase (first parts))]
         [func (assoc command commands)]
         [result (and func ((cdr func) client (rest parts) clients))])
    (DEBUG "process" "parts" parts)
    (DEBUG "process" "command key" command)
    (DEBUG "process" "command pair" func)
    (DEBUG "process" "result" result)
    (unless func (send "I don't understand what you mean\r\n" (client-out client)))
    (print-prompt client)
    result))

(define (process-all-clients clients)
  (when (cons? clients)
    (define msg-queue (filter-map (λ (client)
                                    (do-client-input client clients)) 
                                  clients))
    (when (cons? msg-queue)
      (for ([client clients])
        (do-client-output client msg-queue)))))

(define (do-client-input client clients)
  (let ([in (client-in client)]
        [name (client-name client)])
    (cond [(char-ready? in)
           (DEBUG "do-client-input" "reading")
           (define line (recv in))
           (DEBUG "do-client-input" line)
           (DEBUG "do-client-input" (string-append name ": " line))
           (cond [(eof-object? line)
                  (close-client client)
                  #f]
                 [else 
                  (process client line clients)])]
          [else #f])))

(define (do-client-output client msg-queue)
  (when (cons? msg-queue)
    (define out (client-out client))
    (send "\r\n" out)
    (let _msg-send ([msgs msg-queue])
      (when (cons? msgs)
        (send (first msgs) out)
        (_msg-send (rest msgs))))
    (print-prompt client)))




;;;;;;;;;;;;;;;;;;;;;;;;
;; command processors ;;
;;;;;;;;;;;;;;;;;;;;;;;;

(define (cmd-view client parts clients)
  (define room-id (client-current-room-id client))
  (when (cons? clients)
    (define also-here (filter-map (λ (c) (and (= room-id (client-current-room-id c))
                                              (client-name c)))
                                  clients))
    (send (make-room-desc room-id also-here) (client-out client)))
  #f)


(define (cmd-move client parts clients)
  (define out (client-out client))
  (cond [(= 1 (length parts))
         (let* ([room-id (client-current-room-id client)]
                [dir (string-downcase (first parts))]
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

(define (cmd-say client parts clients)
  (cond [(cons? parts)
         (format "[~a]: \"~a\"\r\n" (client-name client) (string-join parts " "))]
        [else
         (send "You have to say something to be heard\r\n" (client-out client))
         #f]))

(define (cmd-shutdown-server client parts clients)
  (raise "XXX_SHUTDOWN_XXX"))

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
                       (alias-move "leave")
                       (cons "exit" cmd-quit)
                       (cons "quit" cmd-quit)
                       (cons "say" cmd-say)
                       (cons "XXX_SHUTDOWN_XXX" cmd-shutdown-server)))