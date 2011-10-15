#lang racket

(require "server.rkt")
(require "rooms.rkt")
(require "items.rkt")
(require "mobs.rkt")

(define listener (tcp-listen 1337))
(display "Server started. Listening on port 1337\n")

(let listen-more ([clients empty]
                  [rooms (load-rooms)]
                  [items (load-items)]
                  [mobs (load-mobs)])
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
    (unless shutdown (listen-more new-clients 
                                  new-rooms 
                                  new-items 
                                  new-mobs))))