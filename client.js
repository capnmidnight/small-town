var client = (function () {
    var input, userStatus, socket, listeners = {};
    var userName = "";

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
            socket.emit((userName == "") ? "name" : "cmd", val);
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
            socket.on("connect", function () {
                listeners.news.enq("Connected.");
                input.placeholder = "<enter name>";
            });
            new SocketListener("chat", socket);
            new SocketListener("news", socket);
            socket.on("good name", function (data) {
                listeners.news.enq("Name accepted.");
                input.placeholder = "<enter command>";
                userName = data;
            });
            socket.on("userStatus", function(data){
                userStatus.innerHTML = data;
            });
            socket.on("disconnect", function () {
                listeners.news.enq("Disconnected.");
                input.placeholder = "<disconnected>";
                userName = "";
                userStatus.innerHTML = "";
            });
        }
        catch (exp) {
            console.log(exp.message);
        }
    }

    return this;
})();



