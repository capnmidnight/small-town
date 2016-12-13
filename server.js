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
    name = name.toLocaleLowerCase();
    if ( !name.match( /^[a-z][a-z0-9\-]{3,}$/ ) ){
      socket.emit( "bad name", "Bad name.\n\n"
        +
        "Name must be at least 4 characters long and it can only be composed of letters,"
        +
        "numbers, or dash '-'. The first character may not be a number." );
    }
    else {
      var exists = serverState.isNameInUse( name ),
        quit = exists && serverState.users[name].quit,
        message = null,
        op = null;

      if(exists){
        if(quit) {
          op = "good name";
          message = "User account found";
        }
        else {
          op = "bad name";
          message = "Name is already in use, try another one.";
        }
      }
      else{
        op = "good name";
        message = "Create a new user account"
      }

      if(op === "good name"){
        userName = name;
      }
      socket.emit( op, message );
    }
  } );
  socket.on( "password", function ( password ) {
    var roomId = "welcome";
    var hp = 100;
    var items = { "gold": 10 };
    var equipment = null;
    var passwordMessage = "";
    var obj = serverState.users[userName];

    if ( obj ) {
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
      var user = serverState.users[userName] = serverState.users[userName] || new Body( serverState, userName, roomId, hp,
        items, equipment, password );
      user.setSocket(socket);
    }
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