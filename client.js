var client = (function () {
    var input, userStatus, socket, listeners = {};

    function SocketListener(boxId, socket) {
        this.box = document.getElementById(boxId);
        listeners[boxId] = this;
        this.lines = [];
        var b = this;
        socket.on(boxId, function(data) {
            b.enq(data);
        });
        var resizer = function () {
            b.box.style.width = (window.innerWidth - 10) + "px";
            b.box.style.height = (window.innerHeight - 30) + "px";
        }
        resizer();
        window.addEventListener("resize", resizer);
    }

    SocketListener.prototype.enq = function(data) {
        for(var boxId in listeners)
            listeners[boxId].box.style.opacity = 0.25;
        this.box.style.opacity = 1;
        this.lines = this.lines.concat(data.split("\n\n"));
    };

    SocketListener.prototype.next = function() {
        if(this.lines.length > 0) {
            var elem = document.createElement("div");
            var line = this.lines.shift();
            elem.className = "fadeIn line";
            this.box.appendChild(elem);
            setTimeout(function () {
                elem.style.opacity = 1.0;
            }, 1);
            elem.innerHTML = line;
            this.box.scrollTop = this.box.scrollHeight;
        }
    };

    function display() {
        for(var id in listeners) {
            listeners[id].next();
        }
    }

    setInterval(display, 50);

    function submitCommand(evt) {
        if (evt.keyCode == 13) {
            enterCommand();
            evt.preventDefault();
            return false;
        }
        return true;
    }

    function enterCommand() {
        var val = input.value.trim();
        try {
            var type = "cmd";
            switch(input.placeholder)
            {
                case "<enter name>":
                    type = "name";
                break;
                case "<enter password>":
                    type = "password";
                break
                default:
                    type = "cmd";
                break;
            }
            socket.emit(type, val);
            input.value = "";
            input.focus();
        }
        catch (exp) {
            console.log(exp.message);
        }
    }

    this.setup = function (iId, usId) {
        try {
            input = document.getElementById(iId);
            input.addEventListener("keypress", submitCommand, false);
            userStatus = document.getElementById(usId);
            var curHeight = window.innerHeight;
        }
        catch (exp) {
            console.log(exp.message);
        }
    }

    this.run = function () {
        try {
            socket = io.connect(document.location.hostname,
            {
                "reconnect": true,
                "reconnection delay": 1000,
                "max reconnection attempts": 60
            });
            new SocketListener("chat", socket);
            new SocketListener("news", socket);
            socket.on("connect", function () {
                listeners.news.enq("Connected.");
                listeners.news.enq("Enter name.");
                input.placeholder = "<enter name>";
                input.type = "text";
                input.enabled = true;
            });
            socket.on("bad name", function (data) {
                listeners.news.enq(data);
            });
            socket.on("good name", function (data) {
                listeners.news.enq(data);
                listeners.news.enq("Enter password.");
                input.placeholder = "<enter password>";
                input.type = "password";
            });
            socket.on("bad password", function (data){
                listeners.news.enq("Incorrect password. Enter password");
            });
            socket.on("good password", function (data){
                listeners.news.enq("Password accepted.");
                input.placeholder = "<enter command>";
                input.type = "text";
            });
            socket.on("userStatus", function(data){
                userStatus.innerHTML = data;
            });
            socket.on("disconnect", function () {
                listeners.news.enq("Disconnected.");
                input.placeholder = "<disconnected>";
                input.enabled = false;
                userStatus.innerHTML = "";
            });
        }
        catch (exp) {
            console.log(exp.message);
        }
    }

    return this;
})();



