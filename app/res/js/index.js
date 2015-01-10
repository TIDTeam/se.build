; (function Index () {
    var client = io.connect();
    var isConnected = false;
    var user = "Lijun";
    var project = null;
    var base = null;
    var building = false;
    var resourceParameters = [];

    client.on("connect", function(){
        Logger.info("connected to server");
        
        client.send({
            "head":{
                "cmd":"hello", 
                "user":user
            }, 
            "body":{
                "message":"I am coming..."
            }
        });
    });

    client.on("hello", function(message){
        Logger.info("hello::Message Recevied !");
        isConnected = true;
    });

    client.on("exit", function(message){
        Logger.info("exit::Message Recevied !");
        isConnected = false;

        building = false;
        Util.setBuildState("end");
    });

    client.on("workspace", function(message){
        Logger.info("workspace::Message Recevied !");
        Logic.ls(message);
    });

    client.on("encode", function(message){
        var head = message.head;
        var body = message.body;

        building = true;

        Util.setBuildState("encoding");

        switch(head.state){
            case "start":
                Logger.info("**************************************************************************");
                Logger.info("encode::Build start...");
                Logger.info(body.message);
                Logger.info("**************************************************************************");
            break;
            case "init":
                Logger.info("encode::[building]&nbsp;" + body.message);
            break;
            case "encoding":
                Logger.info("encode::[building]&nbsp;" + body.message);
            break;
            case "error":
                Logger.error("encode::[building]&nbsp;" + body.message);
                building = false;

                Util.setBuildState("end")
            break;
            case "end":
                Logger.info("**************************************************************************");
                Logger.info("encode::Build done, Ready deploy...");
                Logger.info(body.message);
                Logger.info("**************************************************************************");
                // building = false;

                // Util.setBuildState("end");

                Logic.resource.apply(Logic, resourceParameters);
            break;
            case "deploy":
                Logger.info("**************************************************************************");
                Logger.info("encode::deploy SED...");
                Logger.info(body.message);
                Logger.info("**************************************************************************");

                building = false;
                Util.setBuildState("end");
            break;
        }
        
    });

    client.on("disconnect", function(){
        Logger.info("disconnect...")
        isConnected = false;

        building = false;
        Util.setBuildState("end");
    });

    ///////////////////////////////////////////////////////
    var Logger = {
        max : 1000,
        items : [],
        write : function(){
            document.querySelector(".console").innerHTML = this.items.join("");
        },
        log : function(level, message){
            var item = '<p class="log ' + level.toLowerCase() + '">[<span>' + level + '</span>]&nbsp;' + new Date() + '&nbsp;:&nbsp;' + message + '</p>'
            this.items.push(item);

            if(this.items.length > this.max){
                this.items.splice(0, this.items.length - this.max);
            }

            this.write();
        },
        info : function(message){
            this.log("INFO", message);
        },
        warn : function(message){
            this.log("WARN", message);
        },
        error : function(message){
            this.log("ERROR", message);
        },
        debug : function(message){
            this.log("DEBUG", message);
        }
    };
    var Util = {
        /**
         * 执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         */
        execHandler : function(handler){
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = handler.args || [];
                var context = handler.context || null;
                var delay = handler.delay || -1;

                if(callback && callback instanceof Function){
                    if(typeof(delay) == "number" && delay >= 0){
                        setTimeout(function(){
                            callback.apply(context, args);
                        }, delay);
                    }else{
                        callback.apply(context, args);
                    }
                }
            }
        },
        /**
         * 合并参数后执行回调
         * @param Object handler {Function callback, Array args, Object context, int delay}
         * @param Array args 参数
         */
        execAfterMergerHandler : function(handler, _args){
            if(handler && handler instanceof Object){
                var callback = handler.callback || null;
                var args = handler.args || [];
                var context = handler.context || null;

                handler.args = _args.concat(args);
            }
            
            this.execHandler(handler);
        },
        setBuildState : function(state){
            var b = document.getElementById("build");
            var r = document.getElementById("reset");

            switch(state){
                case "encoding":
                    b.innerHTML = "Building";
                    b.disabled = r.disabled = true;
                break;
                case "end":
                    b.innerHTML = "Build";
                    b.disabled = r.disabled = false;
                break;
            }
        }
    };
    var Simulate = {
        hook : function (selector, eventType, handler) {
            // body...
            var node = document.querySelector(selector);

            if(node && "1" != node.getAttribute("data-setted")){
                node.addEventListener(eventType, function(e){
                    var target = e.target;

                    if(target && 1 === target.nodeType && "1" == target.getAttribute("data-hook")){
                        Util.execAfterMergerHandler(handler, [e, target]);
                    }
                }, false);
                node.setAttribute("data-setted", "1");
            }
        }
    };

    var Logic = {
        load : function(p, e, d){
            client.send({
                "head": {
                    "cmd": "workspace",
                    "user": user
                },
                "body": {
                    "message": "change workspace! ",
                    "data": {
                        "project": p,
                        "env": e,
                        "deploy": d
                    }
                }
            });
        },
        resource : function(type, p, e, d){
            var pInput = document.querySelector("#" + p);
            var eInput = e ? document.querySelector("#" + p + "_" + e) : null;
            var dInput = d ? document.querySelector("#" + p + "_" + e + "_" + d) : null;

            pInput && (pInput.checked = true);
            eInput && (eInput.checked = true);
            dInput && (dInput.checked = true);

            if(d){
                this.load(p, e, d);
            }
        },
        html : function(selector, str){
            document.querySelector(selector).innerHTML = str;
        },
        tree : function(type, pathname, data, checked){
            var filelist = data.filelist;
            var size = filelist.length;
            var sum = data.checksum;
            var info = null;

            var buf = [];

            buf.push('<dl class="dir">');
            buf.push('<dt class="dirname"><input type="checkbox" name="' + type + '_dir" id="' + type + '_' + sum + '" value="' + type + "," + sum + '" data-hook="1" data-filetype="dir" disabled="disabled"><label for="' + type + '_' + sum + '">' + pathname + '</label></dt>');

            for(var i = 0; i < size; i++){
                info = filelist[i];

                buf.push('<dd class="filename"><input type="checkbox" name="' + type + '_file" id="' + type + '_' + sum + "_" + info.checksum + '" value="' + type + "," + sum + "," + info.checksum + "," + info.absoulte + '" data-hook="1" data-filetype="file"><label for="' + type + '_' + sum + "_" + info.checksum + '"' + (info.isUpdate ? ' class="update"' : '') + '>' + info.filename + '</label></dd>');
            }

            for(var key in data){
                if("filelist" != key && "checksum" != key && data.hasOwnProperty(key)){
                    buf.push('<dd class="subdir">');
                    buf.push(this.tree(type, key, data[key], checked));
                    buf.push('</dd>');
                }
            }

            buf.push('</dl>');

            return buf.join("");
        },
        lib : function(lib){
            if(lib){
                this.html(".lib", this.tree("lib", "lib", lib, true));
            }else{
                this.html(".lib", "not config");
            }
        },
        mod : function(mod){
            if(mod){
                this.html(".mod", this.tree("mod", "mod", mod, true));
            }else{
                this.html(".mod", "not config");
            }
        },
        logic : function(logic){
            if(logic){
                this.html(".logic", this.tree("logic", "logic", logic, false));
            }else{
                this.html(".logic", "not config");
            }
        },
        ls : function(data){
            var body = data.body;
            var lib = body.lib;
            var mod = body.mod;
            var logic = body.logic;

            base = body.base;
            project = body.project;

            //console.info(base);
            //console.dir(project);

            this.lib(lib);
            this.mod(mod);
            this.logic(logic);
        },
        collect : function(){
            if(true === building){
                return false;
            }

            var f = document.querySelector("#fileForm");
            var items = f.elements;
            var size = items.length;
            var item = null;
            var value = "";
            var group = null;
            var type = null;
            var checksum = null;
            var path = null;
            var filetype = null;
            var map = {
                "size": 0,
                "base": null,
                "project": null,
                "files":{}
            };

            for(var i = 0; i < size; i++){
                item = items[i];

                filetype = item.getAttribute("data-filetype");

                if("checkbox" != item.type || "file" != filetype || false === item.checked){
                    continue;
                }

                value = item.value;
                group = value.split(",");
                type = group[0];
                checksum = group[2];
                path = group[3];

                if(!path){
                    continue;
                }

                if(!(type in map.files)){
                    map.files[type] = [];
                }

                map.files[type].push({
                    "type" : type,
                    "path" : path,
                    "checksum": checksum
                });

                map.size++;
            }

            if(map.size > 0){
                map.base = base;
                map.project = project;

                client.send({
                    "head": {
                        "cmd": "encode",
                        "user": user
                    },
                    "body": {
                        "message": "collect resource files ",
                        "data": map
                    }
                });

            }else{
                alert("请选择需要构建的资源文件");
            }
        },
        build : function(){
            var btn = document.querySelector("#build");

            btn.addEventListener("click", Logic.collect, false);
        }
    };

    //-------------------------------
    Simulate.hook(".project-nav", "click", {
        callback : function(e, node){
            e.stopPropagation();

            var v = node.value;
            var items = v.split(",");
            var type = items[0];
            var p_alias = items[1];
            var e_alias = items[2] || null;
            var d_alias = items[3] || null;
            var f = document.querySelector("#projNavForm");

            f.reset();

            resourceParameters = [type, p_alias, e_alias, d_alias];

            Logic.resource.apply(Logic, resourceParameters);
        }
    });

    Logic.build();
})();