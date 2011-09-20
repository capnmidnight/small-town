#lang racket

(require "clients.rkt")
(require "rooms.rkt")

(define listener (tcp-listen 1337))

(let listen-more ([clients empty])
  (process-all-clients clients)
  (listen-more 
   (remove-old-clients 
    (accept-new-clients clients listener))))

(tcp-close listener)