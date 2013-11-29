var http = require("http");
var app = http.createServer(handler);
var socketsio = require("socket.io");;
var io = socketsio.listen(app);
var fs = require("fs");
var core = require("./core.js");
var serverState = require("./serverState.js");
var Body = require("./body.js");

app.listen(8080);

done = false;

var timer = null;
var loop = function ()
{
    if (done)
    {
        clearInterval(timer);
    }
    else
    {
        serverState.respawn();
        for (var bodyId in serverState.users)
        {
            var body = serverState.users[bodyId];
            body.update();
            while (body.inputQ.length > 0)
                body.doCommand();
        }
    }
};
timer = setInterval(loop, 100);

function handler(req, res)
{
    fs.readFile(__dirname + "/index.html",
    function(err, data)
    {
        if(err)
        {
            res.writeHead(500);
            res.end("error loading index.html");
        }
        else
        {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        }
    });
}

io.sockets.on("connection", function(socket)
{
    socket.on("name", function(name)
    {
        if(!serverState.users[name])
        {
            serverState.users[name] = new Body("welcome", 100, {"gold": 10}, null, name, socket);
            socket.emit("good name", name);
        }
        else
        {
            socket.emit("news", "Name is already in use, try another one.");
        }
    });
});
