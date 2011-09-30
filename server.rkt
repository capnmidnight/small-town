#lang racket

(require "rooms.rkt"
         "client.rkt"
         "util.rkt"
         "commands.rkt")

(provide server-cycle)

(define (server-cycle clients listener)
  (remove-old-clients 
   (accept-new-clients 
    (process-all-clients clients) listener)))

;; Prompts a newly connected user for their name
(define (connect-new-client listener)
  (DEBUG "connect-new-client" "accepting new connection")
  (define-values (in out) (tcp-accept listener))
  (send 
   (string-append "\e[1;36m"
                  (call-with-input-file* "welcome.txt" port->string)
                  "\e[0m")
   out)
  (client in out "noname" 'connected 0))

;; Checks to see if there are any new connection attempts and
;; creates a new client object for them.
(define (accept-new-clients clients listener)
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
                  (process client clients line)])]
          [else client])))

(define (process client clients line)
  (DEBUG "process" "client" client)
  (define dispatcher (hash-ref dispatchers (client-state client)))
  (DEBUG "process" "dispatcher" dispatcher)
  (define func (dispatcher line))
  (DEBUG "process" "func" func)
  (define result (and func (func client clients)))
  (DEBUG "process" "result" result)
  (unless func (send "I don't understand what you mean" (client-out client)))
  result)