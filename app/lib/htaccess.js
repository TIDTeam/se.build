//build htaccess file and timestamp

"use strict"

var fs    = require("fs");
var exec = require("child_process").exec;

var $sock = null;
var $base = null;
var $proj = null;
var $tpl = null;

var file = ".htaccess";
var ext = /\.(js|css|jpg|jpeg|png|gif)$/i;

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

var HTAccessFile = {
    rules : [],
    addRule : function(filename, sign){
        //var uri = filename.replace($proj.base + $proj.workspace.env.path, "/");
        var uri = filename.replace($proj.workspace.env.documentroot, "/");
        var lastIndex = uri.lastIndexOf(".");
        var name = uri.substring(0, lastIndex);
        var ext = uri.substring(lastIndex);
        var newName = name + "." + sign + ext;

        // RewriteCond %{REQUEST_URI} ^/css/g.css$ [NC] [AND]
        // RewriteCond %{QUERY_STRING} !^.+$ [NC]
        // RewriteRule css/g.css$ /css/g.css.1c588b41b1520e0fb76a3ad8e4eaca08329a6a1d [PT,L]

        this.rules.push("RewriteCond %{REQUEST_URI} ^" + uri + "$ [NC] [AND]\n");
        this.rules.push("RewriteCond %{QUERY_STRING} !^.+$ [NC]\n")
        this.rules.push("RewriteRule " + uri.substr(1) + "$ " + newName + " [PT,L]\n\n");
        //this.rules.push("RewriteRule " + uri.substr(1) + "$ " + uri + "?" + sign + " [QSA,R=301,L]\n\n");
    },
    read : function(){
        return fs.readFileSync($tpl, "UTF-8");
    },
    write : function(){
        var root = $$proj.workspace.env.documentroot + $proj.workspace.env.path;
        var tpl = this.read();

        this.rules = [];
        this.ls(root, root);

        tpl = tpl.replace("#{rules}", this.rules.join(""));

        fs.writeFileSync($proj.workspace.env.documentroot + file, tpl, {
            "encoding": "utf8"
        });

        emit("deploy", "deploy done...");
    },
    isDirectory : function(name){
        var stat = fs.lstatSync(name);

        return stat.isDirectory();
    },
    isFile : function(name){
        var stat = fs.lstatSync(name);

        return stat.isFile();
    },
    ls : function(root, path){
        if(!fs.existsSync(path)){
            emit("deploy", "deploy path not found(" + path + ")");
            return null;
        }

        var files = fs.readdirSync(path);
        var size = files.length;
        var file = null;
        var absPath = null;

        for(var i = 0; i < size; i++){
            file = files[i];

            console.log("file: " + file);

            // if(file.substr(0, 1) == "." 
            //     || file.indexOf(".mix.") != -1 
            //     || file.indexOf(".md5") != -1
            //     || file.indexOf(".sha1") != -1
            //     || file.indexOf(".sha256") != -1
            //     || file.indexOf(".sha512") != -1
            // ){
            //     continue;
            // }

            absPath = root + file;

            console.log("absoulte: " + absPath);

            if(this.isDirectory(absPath)){
                this.ls(absPath + "/", absPath);
            }else if(this.isFile(absPath) && fs.existsSync(absPath + ".sha1")){
                var sign = fs.readFileSync(absPath + ".sha1", {encoding:"utf8"});

                // fs.writeFileSync(absPath + "." + sign, fs.readFileSync(absPath, "UTF-8"), {
                //     "encoding": "utf8"
                // });
                
                var _fd = fs.openSync(absPath, "r");
                var lastIndex = absPath.lastIndexOf(".");
                var name = absPath.substring(0, lastIndex);
                var ext = absPath.substring(lastIndex);
                var newName = name + "." + sign + ext;

                if(_fd){
                    var irs = fs.createReadStream(absPath, {
                        flags: 'r',
                        fd: _fd,
                        mode: "0644",
                        autoClose: true
                    });
                    var ows = fs.createWriteStream(newName, {
                        mode : "0644"
                    });

                    irs.pipe(ows);

                    HTAccessFile.addRule(absPath, sign);
                }
            }else{
                continue;
            }

        }
    }
};

exports.build = function (sock, base, project) {
    // body...
    $sock = sock;
    $base = base;
    $proj = project;

    $tpl = $base + $proj.buildroot + "/" + file;

    if(!fs.existsSync($tpl)){
        emit("deploy", "The template of the htaccess file not found(" + $tpl + ")");
    }else{
        exec('ulimit -S -n 4096', function (error, stdout, stderr) {
            console.log('ulimit::stdout: ' + stdout);
            console.log('ulimit::stderr: ' + stderr);
            if (error !== null) {
              console.log('ulimit::exec error: ' + error);
            }else{
                HTAccessFile.write();
            }
        });
    }
}