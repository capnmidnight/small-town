#lang racket

(provide DEBUG
         DEBUGGING
         send
         recv)

;; Just does some basic printing that I use in a number of places.
(define DEBUGGING (make-parameter #f))
(define (DEBUG . str)
  (when (DEBUGGING)
    (displayln (string-join str ": "))))

;; Prints a message to a client, ending with a prompt for a command
(define (send msg out)
  (unless (port-closed? out)
    (newline out)
    (displayln msg out)
    (newline out)
    (display " :> " out)
    (flush-output out)))

;; Receives a message from a client without bombing on dead clients.
;; Dead clients will get cleaned up after this, it shouldn't be a
;; problem to not receive notification that the read failed.
(define (recv in)
  (unless (port-closed? in)
    (DEBUG "recv" "reading...")
    ;; different shells use different newline characters, so 'any
    ;; is necessary here.
    (define line (read-line in 'any))
    (DEBUG "recv" line)
    line))