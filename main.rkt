#lang racket

(require "clients.rkt")
(require "rooms.rkt")

(define listener (tcp-listen 1337))
(display "Server started. Listening on port 1337\n")

(let listen-more ([clients empty])
  (listen-more 
   (with-handlers ([(or/c exn:fail? string?)
                    (λ (v) 
                      (DEBUG "main" "exn" v)
                      (close-all-clients clients))])
     (server-cycle clients listener))))