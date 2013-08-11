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

(define (send msg out)
  (unless (port-closed? out)
    (displayln "" out)
    (displayln msg out)
    (displayln "" out)
    (display " :> " out)
    (flush-output out)))

(define (recv in)
  (unless (port-closed? in)
    (DEBUG "recv" "reading...")
    (define line (read-line in 'any))
    (DEBUG "recv" line)
    line))