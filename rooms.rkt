#lang racket

(provide
 make-room-desc
 room
 room-name
 room-descrip
 room-exits
 get-room-exit-id)

(struct room (name descrip exits))

;; this sucks, because there is way more data that we need still
(define rooms (list (room "lobby" "You are in the lobby" '(("north" . 1) ("south" . 2)))
                    (room "bathroom" "You have entered the bathroom" '(("south" . 0)))
                    (room "elevator" "You are in the elevator, on the first floor" '(("north" . 0) ("up" . 3)))
                    (room "floor 2" "You're on the second floor" '(("down" . 2) ("up" . 4)))
                    (room "floor 3" "You're on the third floor" '(("down" . 2)))))

;; returns an index into the rooms list on success, -1 on failure.
(define (get-room-exit-id id dir)
  (or (and (id . < . (length rooms))
           (let ([exits (assoc dir (room-exits (list-ref rooms id)))])
             (and (cons? exits)
                  (cdr exits))))
      -1))  

(define (make-exits named-ids)
  (string-join (map (λ (named-id)
                      (let* ([dir-name (car named-id)]
                             [room-id (cdr named-id)]
                             [room (list-ref rooms room-id)])
                        (format "\t~a: ~a\r\n" dir-name (room-name room))))
                    named-ids)
               ""))

(define (make-room-desc id)
  (when (id . < . (length rooms))
    (define room (list-ref rooms id))
    (when (room? room)
      (format "ROOM: ~a
DESC: ~a

EXITS:
~a"
              (room-name room)
              (room-descrip room)
              (make-exits (room-exits room))))))