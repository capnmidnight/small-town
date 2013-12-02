var http = require("http");
var app = http.createServer(handler);
var socketsio = require("socket.io");;
var io = socketsio.listen(app);
var fs = require("fs");
var core = require("./core.js");
var serverState = require("./serverState.js");
var Body = require("./body.js");

app.listen(8080);

var timer = null;
var loop = function ()
{
    try
    {
        serverState.respawn();
        for (var bodyId in serverState.users)
        {
            var body = serverState.users[bodyId];
            if (body.quit)
            {
                console.log(core.format("{0} quit", bodyId));
                delete serverState.users[bodyId];
            }
            else
            {
                body.update();
                while (body.inputQ.length > 0)
                    body.doCommand();
            }
        }
    }
    catch(exp)
    {
        while(exp != null)
        {
            console.log(core.format("{0} {{1}\n}",
                exp.message,
                core.hashMap(exp, function(k, v)
                {
                    return core.format("\n\t{0}: {1}", k, v);
                }).join("\n")));
            exp = exp.innerException;
        }
    }
};
timer = setInterval(loop, 100);

var mimeTypes = {
    "html": "text/html",
    "png": "image/png"
}

function handler(req, res)
{
    console.log("REQUEST:", req.method, req.url);
    if (req.method === "GET" && req.url[0] === "/")
    {
        if (req.url.length == 1)
            req.url += "index.html";
        var path = __dirname + req.url;
        fs.readFile(path,
        function (err, data)
        {
            if (err)
            {
                serverError(res, req.url);
            }
            else
            {
                var ext = path.substring(path.indexOf(".") + 1);
                res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
                res.end(data);
            }
        });
    }
    else
    {
        serverError(res);
    }
}

function serverError(res, path)
{
    if (path)
    {
        res.writeHead(404);
        res.end("error loading " + path.substring(1));
    }
    else
    {
        res.writeHead(500);
        res.end("error");
    }
}

io.sockets.on("connection", function(socket)
{
    socket.on("name", function(name)
    {
        console.log("naming", name);
        if(serverState.users[name])
        {
            console.log("old name");
            socket.emit("news", "Name is already in use, try another one.");
        }
        else
        {
            console.log("new name");
            serverState.users[name] = new Body("welcome", 100, { "gold": 10 }, null, name, socket);
            socket.emit("good name", name);
        }
    });
    socket.emit("news", "Please enter a name.");
});
