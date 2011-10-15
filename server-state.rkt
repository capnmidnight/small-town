#lang racket

(provide server-state)

(define server-state (hash 'client empty
                           'room empty
                           'item empty
                           'mob empty))

(define state-verbs '(add remove alter))

(define (alter-list verb values lst)
  (case verb 
        [(add)
         (append values lst)]
        [(remove)
         (if (empty? values) 
             lst 
             (remove (first values) lst))]
        [(alter)
         (alter-list 'add 
                     (rest values)
                     (alter-list 'remove 
                                 (list (first values))
                                 lst))]))

(struct state-alter (verb lst-name values))

(define (alter-state server-state state-alter)
  (alter-list (state-alter-verb state-alter) 
              (state-alter-values state-alter)
              (hash-ref server-state (state-alter-lst-name state-alter))))

(define (process-state server-state state-alter-lst)
  (if (empty? state-alter-lst)
      server-state
      (process-state (alter-state (rest state-alter-lst) 
                                  (first state-alter-lst)))))