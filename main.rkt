#lang racket

(require "clients.rkt")
(require "rooms.rkt")

(define listener (tcp-listen 1337))

(let listen-more ([clients empty])
  (process-all-clients clients)
  (let ([current-clients (remove-old-clients (accept-new-clients clients listener))])
       (listen-more current-clients)))

(tcp-close listener)