var input = null;
var output = null;
var done = false;
var everyone = null;
var soFar = "";

function displayln(msg)
{
    soFar += msg + "\n\n";
    output.innerHTML = markdown.toHTML(soFar);
    output.scrollTop = output.scrollHeight;
}

function submitCommand(evt)
{
    if (evt.keyCode == 13)
    {
        var val = input.value.trim().toLowerCase();
        input.value = "";
        everyone["player"].inputQ.push(val);
        return false;
    }
    return true;
}

function setup(iId, oId)
{
    input = document.getElementById(iId);
    input.addEventListener("keypress", submitCommand, false);
    output = document.getElementById(oId);
}

function run()
{
    document.getElementById("start").style.display = "none";
    done = false;
    everyone = {
        "player": new Body("test", 10),
        "dave": new ShopKeep("test", 10, {
            "bird": new Lot(10, { "gold": 1 }),
            "steel-wool": new Lot(12, { "gold": 2 })
        }),
        "mark": new AIBody("test", 10),
        "carl": new AIBody("test", 10)
    };
    setIds(everyone);
    var timer = null;
    var loop = function ()
    {
        if (done)
        {
            clearInterval(timer);
            document.getElementById("start").style.display = "inline-block";
        }
        else
        {
            for (var bodyId in everyone)
            {
                var body = everyone[bodyId];
                body.update();
                while (body.inputQ.length > 0)
                    body.doCommand();
            }
        }
    };
    timer = setInterval(loop, 100);
}
