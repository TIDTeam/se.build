//replace files and set timestamp
//sed -i "" 's#logic/www/app1/index#logic/www/app1/index.22222#g' `grep -E logic/www/app1/index -rl ./app1`

"use strict"

var fs    = require("fs");
var spawn  = require("child_process").spawn;

var $sock = null;
var $base = null;
var $proj = null;
var $deploy = null;
var $sed = null;

var emit = function(state, message){
    $sock.emit("encode", {
        "head": {
            "cmd": "encode",
            "state": state
        },
        "body": {
            "message": message
        }
    })
};

exports.run = function (sock, base, project) {
    // body...
    $sock = sock;
    $base = base;
    $proj = project;
    $deploy = $proj.workspace.deploy;
    $sed = $deploy.sed;

    if($sed && "on" == $sed.turn){
        var r = spawn("./timestamp.sh", []);
    }else{
    	emit("deploy", "Not set SED or SED set to turn off. );
    } 
}