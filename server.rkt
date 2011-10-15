#lang racket

(require "rooms.rkt"
         "client.rkt"
         "util.rkt"
         "commands.rkt")

(provide server-cycle)

(define (server-cycle listener clients rooms items mobs)
  (values 
   (remove-old-clients (process-all-clients (accept-new-clients listener clients) rooms))
   rooms
   items
   mobs
   #f))

;; Prompts a newly connected user for their name
(define (connect-new-client listener)
  (DEBUG "connect-new-client" "accepting new connection")
  (define-values (in out) (tcp-accept listener))
  (send 
   (string-append "\e[1;36m"
                  (call-with-input-file* "welcome.txt" port->string)
                  "\e[0m")
   out)
  (client in out "noname" 'connected 0 empty))

;; Checks to see if there are any new connection attempts and
;; creates a new client object for them.
(define (accept-new-clients listener clients)
  (if (tcp-accept-ready? listener)
      (cons (connect-new-client listener) clients)
      clients))

;; looks for any closed client connections--closed either because the user
;; disconnected or the server forcefully shut them off--and removes them
;; from the list of clients.
(define (remove-old-clients clients)
  (filter (λ (client) (and (not (port-closed? (client-in client)))
                           (not (port-closed? (client-out client)))
                           client))
          clients))

(define (process-all-clients clients rooms)
  (if (cons? clients)
      (filter-map (λ (client)
                    (do-client-input client clients rooms)) 
                  clients)
      clients))

(define (do-client-input client clients rooms)
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
                  (process client clients rooms line)])]
          [else client])))

(define (process client clients rooms line)
  (DEBUG "process" "client" client)
  (define dispatcher (hash-ref dispatchers (client-state client)))
  (DEBUG "process" "dispatcher" dispatcher)
  (define func (dispatcher line))
  (DEBUG "process" "func" func)
  (define result (and func (func client clients rooms)))
  (DEBUG "process" "result" result)
  (unless func (send "I don't understand what you mean" (client-out client)))
  result)