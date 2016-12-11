/* global io */
function Client ( iId, usId ) {
  var input,
      userStatus,
      socket,
      curHeight,
      listeners = { };

  function BoxQueue ( boxId ) {
    this.box = document.getElementById( boxId );
    listeners[boxId] = this;
    this.lines = [ ];
    var b = this;
    var resizer = function () {
      b.box.style.width = ( window.innerWidth - 10 ) + "px";
      b.box.style.height = ( window.innerHeight - 30 ) + "px";
    };
    resizer();
    window.addEventListener( "resize", resizer );
  }

  BoxQueue.prototype.enq = function ( data ) {
    var text = "";
    for ( var boxId in listeners )
      listeners[boxId].box.style.opacity = 0.25;
    this.box.style.opacity = 1;

    if ( typeof ( data ) === "string" )
      text = data;
    else {
      if ( data.message === "say" )
        data.payload.unshift( ":" );
      else if ( data.message === "tell" )
        data.payload.unshift( ": &lt;whisper&gt;" );
      else
        data.payload.unshift( data.message );

      if ( data.fromId !== "server" )
        data.payload.unshift( data.fromId );
      text = data.payload.join( " " );
    }
    text = text.replace( /\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;" );
    this.lines = this.lines.concat( text.split( "\n" ) );
  };

  BoxQueue.prototype.next = function () {
    if ( this.lines.length > 0 ) {
      var elem = document.createElement( "div" );
      var line = this.lines.shift();
      elem.className = "fadeIn line";
      this.box.appendChild( elem );
      setTimeout( function () {
        elem.style.opacity = 1.0;
      }, 1 );
      elem.innerHTML = line;
      this.box.scrollTop = this.box.scrollHeight;
    }
  };

  function display () {
    for ( var id in listeners ) {
      listeners[id].next();
    }
  }

  setInterval( display, 50 );

  var commandQueue = [],
    commandIndex = -1;

  function submitCommand ( evt ) {
    if ( evt.keyCode === 13 ) {
      enterCommand();
      evt.preventDefault();
      return false;
    }
    return true;
  }

  function enterCommand () {
    var val = input.value.trim();
    try {
      var type = "cmd";
      switch ( input.placeholder )
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
      if(type === "cmd") {
        commandQueue.push(val);
        commandIndex = commandQueue.length;
      }
      socket.emit( type, val );
      input.value = "";
      input.focus();
    }
    catch ( exp ) {
      console.log( exp.message );
    }
  }

  function moveCommandQueue(di){
    commandIndex += di;
    input.value = commandQueue[commandIndex];
    input.selectionStart = input.selectionEnd = input.value.length;
  }

  function keyDown(evt){
    if(input.placeholder === "<enter command>") {
      if ( evt.keyCode === 38) {
        if(commandIndex > 0 && commandQueue.length > 0){
          moveCommandQueue(-1);
        }
      }
      else if ( evt.keyCode === 40) {
        if(commandIndex < commandQueue.length){
          moveCommandQueue(+1);
        }
      }
    }
  }

  this.focus = function(){
    input.focus();
  };

  try {
    input = document.getElementById( iId );
    input.addEventListener( "keypress", submitCommand, false );
    input.addEventListener( "keydown", keyDown, false );
    userStatus = document.getElementById( usId );
    curHeight = window.innerHeight;
    new BoxQueue( "news" );
    new BoxQueue( "chat" );
    var protocol = location.protocol.replace("http", "ws"),
      serverPath = protocol + "//" + location.hostname;
    socket = io( serverPath,
        {
          "reconnect": true,
          "reconnection delay": 1000,
          "max reconnection attempts": 60
        } );
    socket.on( "news", function ( data ) {
      console.log( JSON.stringify( data ) );
      listeners[data.type].enq( data );
    } );
    socket.on( "userStatus", function ( data ) {
      userStatus.innerHTML = data;
    } );
    socket.on( "connect", function () {
      listeners.news.enq( "Connected." );
      listeners.news.enq( "Enter name." );
      input.placeholder = "<enter name>";
      input.type = "text";
      input.enabled = true;
    } );
    socket.on( "bad name", function ( data ) {
      listeners.news.enq( data );
    } );
    socket.on( "good name", function ( data ) {
      listeners.news.enq( data );
      listeners.news.enq( "Enter password." );
      input.placeholder = "<enter password>";
      input.type = "password";
    } );
    socket.on( "bad password", function ( data ) {
      listeners.news.enq( "Incorrect password. Enter password" );
    } );
    socket.on( "good password", function ( data ) {
      listeners.news.enq( "Password accepted." );
      input.placeholder = "<enter command>";
      input.type = "text";
    } );
    socket.on( "disconnect", function () {
      listeners.news.enq( "Disconnected." );
      input.placeholder = "<disconnected>";
      input.enabled = false;
      userStatus.innerHTML = "";
    } );
  }
  catch ( exp ) {
    console.log( exp.message );
  }
}