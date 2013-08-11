#lang racket

(require "server.rkt")
(require "rooms.rkt")
(require "items.rkt")
(require "mobs.rkt")
(require "util.rkt")

(define listener (tcp-listen 1337))
(displayln "Server started. Listening on port 1337")

(parameterize ([DEBUGGING #t])
  ;; initiliaze the server
  (let listen-more ([clients empty]
                    [rooms (load-rooms)]
                    [items (load-items)]
                    [mobs (load-mobs)])
    ;; get the server state delta
    (let-values ([(new-clients 
                   new-rooms 
                   new-items 
                   new-mobs 
                   shutdown) 
                  (server-cycle listener 
                                clients 
                                rooms 
                                items 
                                mobs)])
      ;; repeat
      (unless shutdown (listen-more new-clients 
                                    new-rooms 
                                    new-items 
                                    new-mobs)))))