#lang racket

(require "clients.rkt")

(define listener (tcp-listen 1337))
(display "Server started. Listening on port 1337\n")

(let listen-more ([clients empty])
  (listen-more (server-cycle clients listener)))