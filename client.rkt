#lang racket

(require "util.rkt")

(provide
 client
 change-state
 change-name
 move-room
 client-in
 client-out
 client-name
 client-state
 client-current-room-id
 close-client
 close-all-clients)

(define user-states '(connected setup ready))
(define user-roles '(admin player))

;; Every person connected to the server ends up in one of these.
;; Right now, does not prevent multiple users from having this
;; same name. This isn't an issue since users aren't addressable,
;; but will eventually be a problem.
(struct client (in 
                out 
                name
                state
                [current-room-id #:mutable])
  #:transparent)

(define (change-state user new-state)
  (struct-copy client user [state new-state]))

(define (move-room user new-room-id)
  (struct-copy client user [current-room-id new-room-id]))

(define (change-name user new-name)
 (struct-copy client user [name new-name]))

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
