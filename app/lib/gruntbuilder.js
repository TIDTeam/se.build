//grunt file builder

"use strict"

var fs    = require("fs");
var spawn = require("child_process").spawn;
var cs    = require("./checksum");
var ht    = require("./htaccess");

var gruntConfig = "";
var $sock = null;
var $proj = null;
var $base = null;
var $root = null;
var npmTasks = [];
var tasks = [];
var task = null;
var dest = "__build__";

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

var replace = function(name, str){
    gruntConfig = gruntConfig.replace("//{" + name + "}", str);
};

var mktmp = function(){
    var path = $root + dest;

    if(!fs.existsSync(path)){
        fs.mkdirSync(path, "0766");
    }
};

var registNpmTask = function(name){
    npmTasks.push('grunt.loadNpmTasks("' + name + '");\n');
};

var registTask = function(name){
    tasks.push(name);

    task = 'grunt.registerTask("default", ["' + tasks.join('", "') + '"]);\n';
};

var createTasks = function(){
    var type = $proj.workspace.deploy.type;
    tasks = [];
    npmTasks = [];

    // registNpmTask("grunt-contrib-watch");
    // registNpmTask("grunt-contrib-clean");
    // registNpmTask("grunt-contrib-copy");

    switch(type){
        case "js":
            registNpmTask("grunt-contrib-jshint"); 
            registNpmTask("grunt-contrib-uglify");
            registNpmTask("grunt-contrib-concat");
            //registTask("jshint");
            registTask("uglify");
            registTask("concat");
        break;
        case "html":
            registNpmTask("grunt-contrib-htmlmin");
            registTask("htmlmin");
        break;
        case "css":
            registNpmTask("grunt-contrib-cssmin");
            registNpmTask("grunt-contrib-concat");
            registTask("cssmin");
            registTask("concat");
        break;
        case "img":
            registNpmTask("grunt-contrib-imagemin");
            registTask("imagemin");
        break;
    }

    //registTask("copy");
    //registTask("clean");

    replace("npmTasks", npmTasks.join(""));
    replace("task", task);
};

var configure = {
    "js" : function(files){
        var size = files.length;

        var conf = {
            "jshint": {
                "all" : (function(l, filelist){
                    var f = null;
                    var tmp = [];

                    for(var i = 0; i < l; i++){
                        f = filelist[i];

                        tmp.push(f.path);
                    }

                    return tmp;
                })(size, (files["lib"]||[]).concat(files["mod"]||[]).concat(files["logic"]||[]))
            },
            "uglify": {
                "lib": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        "preserveComments": "some",
                        "mangle": {
                            "except": ["require", "exports", "module"]
                        }
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = [src];
                    }

                    return o;
                })(files["lib"]||[]),
                "mod": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        "preserveComments": "some",
                        "mangle": {
                            "except": ["require", "exports", "module"]
                        },
                        "banner": $proj.banner
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = [src];
                    }

                    return o;
                })(files["mod"]||[]),
                "logic": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        "preserveComments": "some",
                        "mangle": {
                            "except": ["require", "exports", "module"]
                        },
                        "banner": $proj.banner
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = [src];
                    }

                    return o;
                })(files["logic"]||[])
            },
            "concat": (function(){
                var deploy = $proj.workspace.deploy;
                var c = deploy.merge;
                var oPath = deploy.path;
                var o = {
                    dist : {
                        options : {
                            process: true
                        },
                        files : (function(){
                            var root = $root + dest + "/";
                            var mlist = null;
                            var tmp = {};

                            for(var key in c){ // group
                                if(c.hasOwnProperty(key)){
                                    root += oPath[key];

                                    for(var f in c[key]){ // files
                                        if(c[key].hasOwnProperty(f)){
                                            mlist = c[key][f];

                                            tmp[root + f] = [];
                                            for(var i = 0, size = mlist.length; i < size; i++){
                                                tmp[root + f].push(root + mlist[i].file);
                                            }
                                        }
                                    }
                                }
                            }
                            return tmp;
                        })()
                    }
                };

                return o;

            })()
        };

        replace("root", $root);
        replace("dest", dest);
        replace("merge", "merge = " + JSON.stringify($proj.workspace.deploy.merge));
        replace("oPath", "oPath = " + JSON.stringify($proj.workspace.deploy.path));
        replace("conf", "conf = " + JSON.stringify(conf));
    },
    "css" : function(files){
        var size = files.length;

        var conf = {
            "cssmin": {
                "lib": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        "banner": $proj.banner
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = [src];
                    }

                    return o;
                })(files["lib"]||[]),
                "mod": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        "banner": $proj.banner
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = [src];
                    }

                    return o;
                })(files["mod"]||[]),
                "logic": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        "banner": $proj.banner
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = [src];
                    }

                    return o;
                })(files["logic"]||[])
            },
            "concat": (function(){
                var deploy = $proj.workspace.deploy;
                var c = deploy.merge;
                var oPath = deploy.path;
                var o = {
                    dist : {
                        options : {
                            process: true
                        },
                        files : (function(){
                            var root = $root + dest + "/";
                            var mlist = null;
                            var tmp = {};

                            for(var key in c){ // group
                                if(c.hasOwnProperty(key)){
                                    root += oPath[key];

                                    for(var f in c[key]){ // files
                                        if(c[key].hasOwnProperty(f)){
                                            mlist = c[key][f];

                                            tmp[root + f] = [];
                                            for(var i = 0, size = mlist.length; i < size; i++){
                                                tmp[root + f].push(root + mlist[i].file);
                                            }
                                        }
                                    }
                                }
                            }
                            return tmp;
                        })()
                    }
                };

                return o;

            })()
        };

        replace("root", $root);
        replace("dest", dest);
        replace("merge", "merge = " + JSON.stringify($proj.workspace.deploy.merge));
        replace("oPath", "oPath = " + JSON.stringify($proj.workspace.deploy.path));
        replace("conf", "conf = " + JSON.stringify(conf));
    },
    "html" : function(files){
        var size = files.length;

        var conf = {
            "htmlmin": {
                "lib": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        optimizationLevel: 3
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = src;
                    }

                    return o;
                })(files["lib"]||[]),
                "mod": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        optimizationLevel: 3
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = src;
                    }

                    return o;
                })(files["mod"]||[]),
                "logic": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        optimizationLevel: 3
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = src;
                    }

                    return o;
                })(files["logic"]||[])
            }
        };

        replace("root", $root);
        replace("dest", dest);
        replace("merge", "merge = " + JSON.stringify($proj.workspace.deploy.merge));
        replace("oPath", "oPath = " + JSON.stringify($proj.workspace.deploy.path));
        replace("conf", "conf = " + JSON.stringify(conf));
    },
    "img" : function(files){
        var size = files.length;

        var conf = {
            "imagemin": {
                "lib": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        optimizationLevel: 3
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = src;
                    }

                    return o;
                })(files["lib"]||[]),
                "mod": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        optimizationLevel: 3
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = src;
                    }

                    return o;
                })(files["mod"]||[]),
                "logic": (function(_files){
                    var o = {
                        "options":{},
                        "files":{}
                    };
                    var build = null;
                    var src = null;
                    var file = null;

                    o.options = {
                        optimizationLevel: 3
                    };

                    for(var i = 0, size = _files.length; i < size; i++){
                        file = _files[i];
                        src = file.path;

                        build = $root + dest + src.replace($root, "/");

                        o.files[build] = src;
                    }

                    return o;
                })(files["logic"]||[])
            }
        };

        replace("root", $root);
        replace("dest", dest);
        replace("merge", "merge = " + JSON.stringify($proj.workspace.deploy.merge));
        replace("oPath", "oPath = " + JSON.stringify($proj.workspace.deploy.path));
        replace("conf", "conf = " + JSON.stringify(conf));
    }
};


var createConfigure = function(files){
    configure[$proj.workspace.deploy.type](files);
};

var writeGruntfile = function(){
    fs.writeFileSync("./Gruntfile.js", gruntConfig, {
        "encoding": "utf8"
    });

    emit("encoding", "create Gruntfile.js");
}

var updateSign = function(){
    //find . -type f -name "index.html" | xargs perl -pi -e 's|(Opera)(\.[a-zA-Z0-9]+)|\1|g'
}

var writeChecksum = function(file){
    //setTimeout(function(){
        if(fs.existsSync(file)){
            cs.FileSHA1CheckSum(file, function(filename, checksum, isSame){
                cs.WriteSHA1CheckSum(filename, checksum);

                emit("encoding", "storage file sign: " + checksum);
            });
        }
    //}, 0);
}

var writeDestChecksum = function(file){
    emit("encoding", "create dest file sign...");
    writeChecksum(file);
}

var writeSourceChecksum = function(file){
    emit("encoding", "create source file sign...");
    writeChecksum(file);
}

var parseGruntData = function(str){
    var prefix = "File ";
    var startIndex = str.indexOf(prefix) + prefix.length;
    var endIndex = str.indexOf(" created");
    var min = str.substring(startIndex, endIndex);
    var source = min.replace("/" + dest + "/", "/");

    writeSourceChecksum(source);
    writeDestChecksum(min);
}

var parseGruntImageData = function(str){
    var prefix = "✔ ";
    var startIndex = str.indexOf(prefix) + prefix.length;
    var endIndex = str.indexOf(" (saved");
    var source = str.substring(startIndex, endIndex);
    var min = $root + dest + source.replace($root, "/");

    writeSourceChecksum(source);
    writeDestChecksum(min);
}

var copy = function(){
    var cwd = $root + dest;
    var target = $proj.base + $proj.workspace.env.path;
    var cur = process.cwd();

    emit("encoding", "Copy " + cwd + " -> " + target);

    process.chdir(cwd);

    var mkdir = spawn("mkdir", ["-p", target]);

    var cp = spawn("cp",  ["-r", "./",  target]);

    cp.stdout.on('data', function (data) {
        console.log('cp stdout: ' + data);
    });

    cp.stderr.on('data', function (data) {
        console.log('cp stderr: ' + data);
        emit("error", data.toString("UTF-8"));
    });

    cp.on('close', function (code) {
        console.log("cp exited with code " + code);

        process.chdir(cur);

        if(code === 0){
            emit("encoding", "copy exited with code " + code);
            clean();
        }else{
            emit("error", "copy exited with code " + code);
        }
    });  
}

var clean = function(){
    var cwd = $root;
    var cur = process.cwd();

    process.chdir(cwd);

    var rm = spawn("rm", ["-r", "./" + dest]);

    rm.stdout.on('data', function (data) {
        console.log('rm stdout: ' + data);
    });

    rm.stderr.on('data', function (data) {
        console.log('rm stderr: ' + data);
        emit("error", data.toString("UTF-8"));
    });

    rm.on('close', function (code) {
        console.log("rm exited with code " + code);

        process.chdir(cur);

        if(code === 0){
            emit("end", "clean exited with code " + code);
            ht.build($sock, $base, $proj);
        }else{
            emit("error", "clean exited with code " + code);
        }
    });  
}

var run = function(){
    emit("encoding", "call Grunt....");

    //process.chdir(process.cwd());
    var grunt = spawn("grunt");

    grunt.stdout.on('data', function (data) {
        console.log('grunt stdout: ' + data);
        var str = data.toString("UTF-8");
        
        emit("encoding", str);

        if(str.indexOf("File ") != -1){
            parseGruntData(str);
        }else if(str.indexOf("✔ ") != -1){
            parseGruntImageData(str);
        }
    });

    grunt.stderr.on('data', function (data) {
        console.log('grunt stderr: ' + data);
        emit("error", data.toString("UTF-8"));
    });

    grunt.on('close', function (code) {
        console.log("grunt exited with code " + code);

        if(code === 0){
            emit("encoding", "grunt exited with code " + code);
            copy();
        }else{
            emit("error", "grunt exited with code " + code);
        }
    });

}

exports.createGruntfile = function (socket, base, project, files) {
    $sock = socket;
    $proj = project;
    $base = base;
    $root = $base + $proj.buildroot + $proj.workspace.env.path;

    emit("encoding", "init grunt tasks...");
    gruntConfig = fs.readFileSync("./tpl/Gruntfile.tpl", "UTF-8");

    mktmp();
    createTasks();
    createConfigure(files);
    writeGruntfile();
    run();
};