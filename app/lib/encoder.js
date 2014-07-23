//encoder

"use strict"

var GruntBuilder = null;

var $sock = null;
var $proj = null;
var $base = null;

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

var build = function(type, file){
    emit("encoding", "[" + file.type + "]" + file.path);

    GruntBuilder.createGruntfile($sock, $base, $proj, type, file);
};

var encoder = function(type, files){
    emit("encoding", "fetch " + type + " files(" + files.length + ")");

    // for(var i = 0, size = files.length; i < size; i++){
    //     build(type, files[i]);
    // }

    GruntBuilder.createGruntfile($sock, $base, $proj, type, files);
};

var init = function(socket, size, base, project, files){
    $sock = socket;
    $proj = project;
    $base = base;

    emit("init", "initialization encoding...");

    console.info(JSON.stringify(files))

    // for(var type in files){
    //     if(files.hasOwnProperty(type)){
    //         encoder(type, files[type]);
    //     }
    // }
    GruntBuilder = require("./gruntbuilder");
    GruntBuilder.createGruntfile($sock, $base, $proj, files);
};

exports.encode = function (socket, message) {
    var head = message.head;
    var body = message.body;
    var data = body.data;
    var size = data.size;
    var base = data.base;
    var project = data.project;
    var files = data.files; //{checksum, type, path}

    init(socket, size, base, project, files);

};
