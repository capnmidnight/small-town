var input = null;
var output = null;
var done = false;
var everyone = null;
var soFar = "";
function displayln(msg){
    soFar += msg + "\n\n";
    output.innerHTML = markdown.toHTML(soFar);
    output.scrollTop = output.scrollHeight;
}

function run() {
    try{
		document.getElementById("start").style.display = "none";
        done = false;
        everyone = {"player": new Body("test", 10),
                    "dave": new Body("test", 10),
                    "mark": new Body("test", 10),
                    "carl": new Body("test", 10)};
        setIds(everyone);
		var timer = null;
		var loop = function() {
			if(done){
				clearInterval(timer);
				document.getElementById("start").style.display = "inline-block";
			}
			else {
				var bodyId = "player";
				var body = everyone[bodyId];
				if(body.inputQ.length > 0){
					if(body.hp > 0){
						displayln(bodyId);
						body.doCommand();
					}
					else{ 
						displayln("Knocked out!"); 
					}
				}
			}
		};
		timer = setInterval(loop, 100);
    }
    catch(exp){
        console.log(exp);
        clearInterval(timer);
    }
}

function submitCommand(evt){
    if(evt.keyCode == 13){
        var val = input.value.trim().toLowerCase();
        input.value = "";
        everyone["player"].inputQ.push(val);
        return false;
    }
    return true;
}

function setup(iId, oId){
    input = document.getElementById(iId);
    input.addEventListener("keypress", submitCommand, false);
    output = document.getElementById(oId);
}
