var client = (function()
{
  var input, output, socket;
  var userName = "";
  var linesToDisplay = [];

  function displayln(msg)
  {
    linesToDisplay = msg.split("\n\n");
  }

  function display()
  {
    if(linesToDisplay.length > 0) {
      output.innerHTML += linesToDisplay.shift() + "<br/>\n";
      output.scrollTop = output.scrollHeight;
    }
  }

  setInterval(display, 100);

  function submitCommand(evt)
  {
    if (evt.keyCode == 13)
    {
      enterCommand();
      evt.preventDefault();
      return false;
    }
    return true;
  }

  function enterCommand()
  {
    var val = input.value.trim();
    try
    {
      console.log((userName == "") ? "name" : "cmd", val);
      socket.emit((userName == "") ? "name" : "cmd", val);
      input.value = "";
      input.focus();
    }
    catch (exp)
    {
      console.log(exp.message);
    }
  }

  this.setup = function(iId, oId)
  {
    try
    {
      input = document.getElementById(iId);
      input.addEventListener("keypress", submitCommand, false);
      output = document.getElementById(oId);
    }
    catch (exp)
    {
      console.log(exp.message);
    }
  }

  this.run = function()
  {
    try
    {
      socket = io.connect("http://localhost:8080/",
                          {
                            "reconnect": true,
                            "reconnection delay": 1000,
                            "max reconnection attempts": 60
                          });
      socket.on("connect", function ()
                {
                  displayln("Connected.");
                });
      socket.on("good name", function (data)
                {
                  displayln("Name accepted.");
                  userName = data;
                });
      socket.on("news", displayln);
      socket.on("disconnect", function ()
                {
                  displayln("Disconnected.");
                  userName = "";
                });
    }
    catch (exp)
    {
      console.log(exp.message);
    }
  }

  return this;
})();


