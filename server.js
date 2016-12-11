/* global require, module, exports, process */

var format = require( "util" ).format,
fs = require( "fs" ),
ServerState = require( "./src/serverState.js" ),
Body = require( "./src/body.js" ),
core = require( './src/core.js' ),
serverState = new ServerState(),
notion = require( "notion-node" );

notion(null, null, null, null, function ( socket ) {
  var userName = null;
  socket.on( "name", function ( name ) {
    if ( serverState.isNameInUse( name ) ) {
      socket.emit( "bad name", "Name is already in use, try another one." );
    }
    else if ( !name.match( /^[a-zA-Z][a-zA-Z0-9\-]{3,}$/ ) ){
      socket.emit( "bad name", "Bad name.\n\n"
        +
        "Name must be at least 4 characters long and it can only be composed of letters,"
        +
        "numbers, or dash '-'. The first character may not be a number." );
    }
    else {
      fs.exists( "users/" + name + ".js", function(yes){
        var message = yes
          ? "User account found:"
          : "Create a new user account:";
        userName = name;
        socket.emit( "good name", message );
      } );
    }
  } );
  socket.on( "password", function ( password ) {
    var fileName = "users/" + userName + ".js";
    fs.readFile( fileName, { encoding: "utf8" }, function ( err, jsn ) {
      var roomId = "welcome";
      var hp = 100;
      var items = { "gold": 10 };
      var equipment = null;
      var passwordMessage = "";
      if ( !err ) {
        var obj = JSON.parse( jsn );
        if ( password != obj.password ){
          passwordMessage = "Incorrect password";
        }
        else {
          passwordMessage = "Success!";
          roomId = obj.roomId;
          hp = obj.hp;
          items = obj.items;
          equipment = obj.equipment;
        }
      }
      else if ( password.length < 8 ){
        passwordMessage = "Password must be at least 8 characters long";
      }
      else{
        passwordMessage = "Success!";
      }

      if ( passwordMessage != "Success!" ){
        socket.emit( "bad password", passwordMessage );
      }
      else {
        socket.emit( "good password", passwordMessage );
        serverState.users[userName] = new Body( serverState, userName, roomId, hp,
          items, equipment, socket, password );
      }
    } );
  } );
} );

if ( process.argv.indexOf( "--admin" ) > -1 ) {
  var readline = require( 'readline' );
  var rl = readline.createInterface( process.stdin, process.stdout );
  rl.setPrompt( 'MUD ADMIN :> ' );
  rl.on( 'line', function ( line ) {
    var cmd = line.trim();
    core.log( cmd );
    try {
      core.log( eval( cmd ) );
    }
    catch ( exp ) {
      process.stderr.write( exp.message + "\n" );
    }
    rl.prompt();
  } )
  .on( 'close', function () {
    process.exit( 0 );
  } );
  rl.prompt();
}

setInterval( function loop () {
  serverState.pump();
}, 10 );