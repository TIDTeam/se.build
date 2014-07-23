//workspace

"use strict"

var fs = require("fs");
var cs = require("./checksum");

var Workspace = function(){
    var projectConfig = JSON.parse(fs.readFileSync("./conf/project.json", "UTF-8"));
    this.conf = projectConfig;
    this.base = projectConfig.base;
    this.projects = projectConfig.projects;
};

Workspace.prototype = {
    getProjectByAlias : function(alias){
        var size = this.projects.length;
        var project = null;

        for(var i = 0; i < size; i++){
            project = this.projects[i];

            if(project.alias === alias){
                return project;
            }
        }

        return null;
    },
    getProjectWorkspaceByAlias : function(projectAlias, envAlias, deployAlias){
        var project = this.getProjectByAlias(projectAlias);
        var wp = project.workspace;
        var env = wp.env;
        var esize = env.length;
        var deploy = wp.deploy;
        var dsize = deploy.length;
        var o = {
            "base": this.base,
            "project": project
        };

        for(var i = 0; i < esize; i++){
            if(env[i].alias === envAlias){
                o["project"]["workspace"]["env"] = env[i];
                break;
            }
        }

        for(var j = 0; j < dsize; j++){
            if(deploy[j].alias === deployAlias){
                o["project"]["workspace"]["deploy"] = deploy[j];
                break;
            }
        }

        return o;
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
            return null;
        }

        var files = fs.readdirSync(path);
        var size = files.length;
        var file = null;
        var absPath = null;
        var map = {
            "checksum": cs.TextSHA1CheckSum(path),
            "filelist": []
        };

        for(var i = 0; i < size; i++){
            file = files[i];

            if(file.substr(0, 1) == "." 
                || file.indexOf(".mix.") != -1 
                || file.indexOf(".md5") != -1
                || file.indexOf(".sha1") != -1
                || file.indexOf(".sha256") != -1
                || file.indexOf(".sha512") != -1
            ){
                continue;
            }

            absPath = root + file;

            //console.log("absoulte: " + absPath);

            if(this.isDirectory(absPath)){
                map[file] = this.ls(absPath + "/", absPath);
            }else if(this.isFile(absPath)){
                cs.FileSHA1CheckSum(absPath, function(filename, checksum, isUpdate, _file){
                    map.filelist.push({
                        "absoulte": filename,
                        "checksum": checksum,
                        "isUpdate": isUpdate,
                        "filename": _file
                    });
                }, [file]);
            }else{
                continue;
            }

        }

        //console.log(map);

        return map;
    },
    parse : function(data){
        var base = data.base;
        var project = data.project;
        var wp = project.workspace;
        var env = wp.env;
        var deploy = wp.deploy;
        var broot = project.buildroot;

        //console.log("----------------------------");
        //console.log(JSON.stringify(project));

        var prefix = base + broot + env.path;
        var libPath = deploy.path.lib ? prefix + deploy.path.lib : null;
        var modPath = deploy.path.mod ? prefix + deploy.path.mod : null;
        var logicPath = deploy.path.logic ? prefix + deploy.path.logic : null;

        var lib = libPath ? this.ls(libPath, libPath) : null;
        var mod = modPath ? this.ls(modPath, modPath) : null;
        var logic = logicPath ? this.ls(logicPath, logicPath) : null;

        return {
            "message": "list files",
            "base": base,
            "project": project,
            "lib" : lib,
            "mod" : mod,
            "logic" : logic
        };
    },
    read : function(body){
        var data = body.data;

        //console.log(JSON.stringify(body));

        return this.parse(this.getProjectWorkspaceByAlias(data.project, data.env, data.deploy));
    }
};


exports.newInstance = function () {
    return new Workspace();
}