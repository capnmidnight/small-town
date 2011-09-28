#lang racket

(provide DEBUG)

;; Just does some basic printing that I use in a number of places.
;; I should be using a "parameter" (which is different from an
;; argument) to control whether or not printing is enabled, but
;; don't care to take the time.
(define (DEBUG . str)
  (when #t 
    (for ([part str]
          [seperator (reverse (cons "\n" (make-list (sub1 (length str)) ": ")))])
      (display part)
      (display seperator))))