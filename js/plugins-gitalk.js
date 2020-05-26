(function () {
    /* eslint-disable no-unused-vars */
    function install(hook) {
      var dom = Docsify.dom;
  
      hook.mounted(function (_) {
        var div = dom.create('div');
        div.id = 'gitalk-container';
        var main = dom.getNode('#main');
        div.style = "width: " + (main.clientWidth) + "px; margin: 0 auto 20px;";
        dom.appendTo(dom.find('.content'), div);
      });
  
      hook.doneEach(function (_) {
        console.log("gitalk.render");
        var el = document.getElementById('gitalk-container');
        if (el == null)return // 这一行自己加的
        while (el.hasChildNodes()) {
          el.removeChild(el.firstChild);
        }
  
        // eslint-disable-next-line
        gitalk.render('gitalk-container');
      });
    }
  
    $docsify.plugins = [].concat(install, $docsify.plugins);
  
  }());
  