#lang racket

(require "rooms.rkt")
(require "client.rkt")
(require "util.rkt")

(provide server-cycle)

(define (server-cycle clients listener)
  (remove-old-clients 
   (accept-new-clients 
    (process-all-clients clients) listener)))

(define (send msg out)
  (unless (port-closed? out)
    (display (string-append "\r\n" msg "\r\n :> ") out)
    (flush-output out)))

(define (recv in)
  (unless (port-closed? in)
    (DEBUG "recv" "reading...")
    (define line (read-line in 'any))
    (DEBUG "recv" line)
    line))

;; Prompts a newly connected user for their name
(define (connect-new-client listener)
  (DEBUG "connect-new-client" "accepting new connection")
  (define-values (in out) (tcp-accept listener))
  (send 
   (string-append "\e[1;36m"
                  (regexp-replace* #rx"\n" (regexp-replace* #rx"\r\n" (call-with-input-file* "welcome.txt" port->string) "\n") "\r\n")  ;; this little rigamorole is to correct for the bullshit newline situation between OS X and everybody else
                  "\e[0m")
   out)
  (let* ([input (read-line in 'any)]
         [name (and (not (eof-object? input)) input)] ;; fail if the user disconnected
         [new-client (and name (client in out name 'connected 0))]) ;; create the user with their name, or fail
    (DEBUG "connect-new-client" "input" input)
    (DEBUG "connect-new-client" "name recognized" name)
    (DEBUG "connect-new-client" new-client)
    (unless new-client (close-client (client in out #f 'connected 0)))
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

(define (process-all-clients clients)
  (if (cons? clients)
      (filter-map (λ (client)
                    (do-client-input client clients)) 
                  clients)
      clients))

(define (do-client-input client clients)
  (let ([in (client-in client)]
        [name (client-name client)])
    (cond [(char-ready? in)
           (DEBUG "do-client-input" "reading")
           (define line (recv in))
           (DEBUG "do-client-input" (string-append name ": " line))
           (cond [(eof-object? line)
                  (close-client client)
                  #f]
                 [else 
                  (process client line clients)])]
          [else client])))

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
    (unless func (send "I don't understand what you mean" (client-out client)))
    result))

;;;;;;;;;;;;;;;;;;;;;;;;
;; command processors ;;
;;;;;;;;;;;;;;;;;;;;;;;;

(define (cmd-view client parts clients)
  (define room-id (client-current-room-id client))
  (when (cons? clients)
    (define also-here (for/list ([c clients]
                                 #:when (= room-id (client-current-room-id c)))
                        (client-name c)))
    (send (make-room-desc room-id also-here) (client-out client)))
  client)


(define (cmd-move client parts clients)
  (define out (client-out client))
  (cond [(= 1 (length parts))
         (let* ([room-id (client-current-room-id client)]
                [dir (string-downcase (first parts))]
                [new-room-id (get-room-exit-id room-id dir)])
           (cond [(new-room-id . > . -1)
                  (cmd-view (move-room client new-room-id) parts clients)]
                 [else
                  (send "You can't go that direction" (client-out client))
                  client]))]
        [else
         (send "Please provide 1 and only 1 move direction" out)
         client]))

(define (alias-move dir)
  (cons dir (λ (client parts clients)
              (cmd-move client (cons dir parts) clients))))

(define (cmd-quit client parts clients)
  (for ([c clients])
    (send (format "~a has quit." (client-name client)) (client-out c)))
  (close-client client)
  #f)

(define (cmd-say client parts clients)
  (cond [(cons? parts)
         (for ([c clients])
           (send (format "[~a]: \"~a\"" (client-name client) (string-join parts " ")) (client-out c)))           ]
        [else
         (send "You have to say something to be heard" (client-out client))])
  client)

(define (cmd-shutdown-server client parts clients)
  (raise "KILL KILL KILL KILL"))

(define commands (list (cons "view" cmd-view)
                       (cons "look" cmd-view)
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
