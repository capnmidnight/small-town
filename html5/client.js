var client = (function () {
    var input, output, socket;
    var userName = "";
    var linesToDisplay = [];

    function displayln(msg) {
        linesToDisplay = msg.split("\n\n");
    }

    function display() {
        if (linesToDisplay.length > 0) {
            var elem = document.createElement("div");
            var line = linesToDisplay.shift();
            elem.className = "fadeIn";
            output.appendChild(elem);
            setTimeout(function () {
                elem.style.opacity = 1.0;
            }, 1);
            elem.innerHTML = line;
            output.scrollTop = output.scrollHeight;
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
            console.log((userName == "") ? "name" : "cmd", val);
            socket.emit((userName == "") ? "name" : "cmd", val);
            input.value = "";
            input.focus();
        }
        catch (exp) {
            console.log(exp.message);
        }
    }

    this.setup = function (iId, oId) {
        try {
            input = document.getElementById(iId);
            input.addEventListener("keypress", submitCommand, false);
            output = document.getElementById(oId);
            var curHeight = window.innerHeight;
            var resizer = function () {
                output.style.height = (window.innerHeight - 30) + "px";
                output.style.width = (window.innerWidth - 10) + "px";
            }
            resizer();
            window.addEventListener("resize", resizer);
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
                displayln("Connected.");
                input.placeholder = "<enter name>";
            });
            socket.on("good name", function (data) {
                displayln("Name accepted.");
                input.placeholder = "<enter command>";
                userName = data;
            });
            socket.on("news", displayln);
            socket.on("disconnect", function () {
                displayln("Disconnected.");
                input.placeholder = "<disconnected>";
                userName = "";
            });
        }
        catch (exp) {
            console.log(exp.message);
        }
    }

    return this;
})();



