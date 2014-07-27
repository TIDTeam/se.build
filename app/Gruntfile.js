//Grunt Configure

"use strict";

module.exports = function(grunt) {
    // Do grunt-related things in here
    var $root = "/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/";
    var dest = "__build__";
    var oPath = null;
    var merge = null;

    //configure
    var conf = null;

    merge = {"lib":{"se.mix.js":[{"banner":"/*! Zepto v1.1.4 - zepto event ajax form ie - zeptojs.com/license */\n","file":"zepto-1.1.4.js"},{"banner":"/*! Sea.js 2.3.0 | seajs.org/LICENSE.md */\n","file":"sea-2.3.0.js"},{"banner":"/*! Sea.js config */\n","file":"se.js"}]}};
    
    oPath = {"lib":"js/lib/","mod":"js/mod/","logic":"js/logic/"};

    conf = {"jshint":{"all":[]},"uglify":{"lib":{"options":{"preserveComments":"some","mangle":{"except":["require","exports","module"]}},"files":{"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/se.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/se.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/sea-2.2.0.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/sea-2.2.0.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/sea-2.3.0.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/sea-2.3.0.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/zepto-1.1.3.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/zepto-1.1.3.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/zepto-1.1.4.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/zepto-1.1.4.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/extra/iscroll5/iscroll-infinite.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/extra/iscroll5/iscroll-infinite.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/extra/iscroll5/iscroll-lite.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/extra/iscroll5/iscroll-lite.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/extra/iscroll5/iscroll-probe.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/extra/iscroll5/iscroll-probe.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/extra/iscroll5/iscroll-zoom.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/extra/iscroll5/iscroll-zoom.js"],"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/extra/iscroll5/iscroll.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/js/lib/extra/iscroll5/iscroll.js"]}},"mod":{"options":{"preserveComments":"some","mangle":{"except":["require","exports","module"]},"banner":"/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com */\n"},"files":{}},"logic":{"options":{"preserveComments":"some","mangle":{"except":["require","exports","module"]},"banner":"/*! Copyright (c) SESHENGHUO.COM - Author: LIJUN - Email: zwlijun@gmail.com */\n"},"files":{}}},"concat":{"dist":{"options":{"process":true},"files":{"/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/se.mix.js":["/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/zepto-1.1.4.js","/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/sea-2.3.0.js","/data/wwwroot/seshenghuo/build.seshenghuo.com/projects/res.seshenghuo.com/htdocs/__build__/js/lib/se.js"]}}}};

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
    grunt.loadNpmTasks("grunt-contrib-jshint");
grunt.loadNpmTasks("grunt-contrib-uglify");
grunt.loadNpmTasks("grunt-contrib-concat");


    //regist task
    grunt.registerTask("default", ["uglify", "concat"]);


};