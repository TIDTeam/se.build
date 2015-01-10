//Grunt Configure

"use strict";

var fs = require("fs");

module.exports = function(grunt) {
    // Do grunt-related things in here
    var $root = "//{root}";
    var dest = "//{dest}";
    var oPath = null;
    var merge = null;

    //configure
    var conf = null;

    //{merge};
    
    //{oPath};

    //{conf};

    conf.pkg = grunt.file.readJSON('package.json');

    if("concat" in conf 
            && conf.concat 
            && conf.concat.dist 
            && conf.concat.dist.options 
            && conf.concat.dist.options.process){
            
        conf["concat"].dist.options.process = function(src, filepath){
            var banner = (function find(path){
                var root = $root + dest + "/";
                var mlist = null;
                var tmp = null;

                for(var key in merge){ // group
                    if(merge.hasOwnProperty(key)){
                        root += oPath[key];

                        for(var f in merge[key]){ // files
                            if(merge[key].hasOwnProperty(f)){
                                mlist = merge[key][f];

                                for(var i = 0, size = mlist.length; i < size; i++){
                                    tmp = root + mlist[i].file;

                                    if(tmp == path){
                                        return mlist[i].banner;
                                    }
                                }
                            }
                        }
                    }
                }

                return "";
            })(filepath);

            return banner + src;
        }
    }

    grunt.initConfig(conf);

    //load npm task
    //{npmTasks}

    //regist task
    //{task}

};