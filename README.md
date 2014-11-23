<h1>Project配置文件</h1>

<pre>
- base                     //{String} 构建项目部署基础路径
+ projects                 //{Array} 项目配置
  - name                   //{String} 项目名称
  - alias                  //{String} 项目别名
  - vctrl                  //{String} 版本控制，未实现
  - base                   //{String} 项目发布的基础路径
  - buildroot              //{String} 项目在构建工具中的根目录
  - banner                 //{String} 全局banner配置
  - workspace              //{Object} 工作目录
    + env                  //{Array} 项目环境配置，如开发、正式等
      - name               //{String} 环境名称
      - alias              //{String} 环境别名
      - root               //{String} 部署后的根目录（虚拟主机的DocumentRoot），生成.htaccess文件使用
      - path               //{String} 环境对应的目录
    + deploy               //{Array} 资源部署目录
      - name               //{String} 资源名称
      - alias              //{String} 资源别名
      - type               //{String} 资源类型（js/css/img/html）
      + sed
        - turn             //{String} 开关（on/off）
        - keypath          //{String} 关键路径，如：/js/，/css/，/img/
        - include          //{Boolean} 替换时是否包含关键路径
        - findpath         //{Array} 查找路径配置
      - path               //{Object} 资源路径
        - lib              //{String} 库文件路径
        - mod              //{String} 模块文件路径
        - logic            //{String} 业务文件路径
      - merge              //{Object} 合并配置
        - [type]           //{Object} 类型，对应 path 中的 lib, mod, logc
          + [filename]     //{Array} 合并后的文件名称
            - banner       //{String} 文件banner
            - file         //{String} 文件名
</pre>

<h1>资源文件版本控制</h1>
<p>资源版本控制采用sed命令来操作，通过工作副本中配置sed参数来处理。</p>
<p>sed命令格式模板：</p>
<p>sed -i "" 's#<i>name</i>\(\.[0-9a-zA-Z]\{40\}\)\{0,1\}\.<i>ext</i>#<i>name</i>.<i>sha1</i>.<i>ext</i>#g' `grep -E <i>name</i>\(\.[0-9a-zA-Z]\{40\}\)\{0,1\}\.<i>ext</i> -rl <i>findpath</i>`</p>
<p>sed -i "" 's#\"<i>name</i>\(\.[0-9a-zA-Z]\{40\}\)\{0,1\}\"#<i>name</i>.<i>sha1</i>.<i>ext</i>#g' `grep -E \"<i>name</i>\(\.[0-9a-zA-Z]\{40\}\)\{0,1\}\" -rl <i>findpath</i>`</p>
<p><del>资源版本控制采用Apache的URLWrite实现，通过动态生成.htaccess文件来保障资源更新问题。</del></p>

<del>
  <h1>.htaccess文件说明</h1>
  <p>动态创建.htaccess文件需要在构建项目的根据下，创建一个.htaccess的文件，格式如下</p>
  <pre>  
     Options -Indexes +FollowSymLinks
     
     RewriteEngine On
     
     #{rules}
  </pre>
  <p>
  在构建完成后，工具会去找.htaccess模板文件，如果没有则忽略，否则会对模板文件进行解析，
  并且将 #{rules} 替换成正式配置内容，具体可以参考 htaccess.js 文件中的 addRule() 方法 和 write()方法
  </p> 
</del>
   
   
   
   
