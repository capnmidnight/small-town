#lang racket

(require "rooms.rkt")

(provide
 process-all-clients
 accept-new-clients
 remove-old-clients
 close-all-clients)

(struct client (in 
                out 
                name 
                [current-room-id #:mutable]))

(define (trim-name name)
  (display (format "User entered \"~a\" for name\n" name))
  (substring name 21 (sub1 (string-length name))))

(define (connect-new-client listener)
  (display "accepting new connection\n")
  (define-values (in out) (tcp-accept listener))
  (display 
   "Welcome to a very simple, Multi-User Dungeon that I have created. This MUD
is almost completely useless at this time. However, you can run around in
the few rooms that exist and try to get a feel for things! So, without further
ado...

ENTER YOUR NAME, MOTHERFUCKER: " out)
  (flush-output out)
  (let ([new-client (client in out (trim-name (read-line in)) 0)])
    (cmd-view new-client empty)
    new-client))

(define (accept-new-clients clients listener)
  (if (tcp-accept-ready? listener)
      (cons (connect-new-client listener) clients)
      clients))

(define (remove-old-clients clients)
  (let _remove ([good empty]
                [left clients])
    (if (cons? left)
        (let* ([client (first left)]
               [in (client-in client)]
               [out (client-out client)])
          (if (or (port-closed? in)
                  (port-closed? out))
              (_remove good (rest left))
              (_remove (cons client good) (rest left))))
        good)))

(define (close-client client)
  (display (format "Closing client: ~a\n" (client-name client)))
  (close-input-port (client-in client))
  (close-output-port (client-out client)))

(define (close-all-clients clients)
  (when (cons? clients)
    (close-client (first clients))
    (close-all-clients (rest clients))))

(define (process client line)
  (let* ([parts (regexp-split #rx" " line)]
         [command (first parts)]
         [func (assoc command commands)])
    (if func
        ((cdr func) client (rest parts))
        (display "I don't understand what you mean\r\n" (client-out client)))))

(define (do-client-input client)
  (when (char-ready? (client-in client))
    (define line (read-line (client-in client)))
    (display (format "INCOMING! ~a [~a]\n" (client-name client) line))
    (newline)
    (if (eof-object? line)
        (close-client client)
        (process client (substring line 0 (sub1 (string-length line)))))))

(define (do-client-output client)
  (let _send ([msgs msg-queue])
    (when (cons? _send)
      (display (first msgs) (client-out client))
      (_send (rest msgs)))))

(define (process-all-clients clients)
  (if (cons? clients)
      (let ([client (first clients)])
        (do-client-input client)
        (do-client-output client)
        (process-all-clients (rest clients)))
      (set! msg-queue empty)))

(define (cmd-view client parts)
  (display (make-room-desc (client-current-room-id client)) (client-out client)))

(define (cmd-move client parts)
  (if (and (= 1 (length parts))
           (let* ([room-id (client-current-room-id client)]
                  [dir (first parts)]
                  [new-room-id (get-room-exit-id room-id dir)])
             (new-room-id . > . -1)))
      (cmd-view client parts)
      (display "You can't go that direction\r\n" (client-out client))))

(define (cmd-quit client parts)
  (close-client client))

(define (cmd-bad-word client parts)
  (display "Hey now, that was a bad word. Only I'm allowed to cuss here.\r\n" (client-out client)))

(define msg-queue empty)

(define (cmd-say client parts)
  (if (cons? parts)
      (set! msg-queue (cons (format "MSG [~a]: ~a" (client-name client) (string-join parts " ")) msg-queue))
      (display "You have to say something to be heard\r\n" (client-out client))))

(define commands (list (cons "view" cmd-view)
                       (cons "move" cmd-move)
                       (cons "quit" cmd-quit)
                       (cons "say" cmd-say)
                       (cons "fuck" cmd-bad-word)
                       (cons "shit" cmd-bad-word)
                       (cons "damn" cmd-bad-word)
                       (cons "dammit" cmd-bad-word)
                       (cons "damnit" cmd-bad-word)))