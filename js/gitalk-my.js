

function lablegen(hook) {
    hook.doneEach(function () {
        gitalk = new Gitalk({
            clientID: '9bacad4a134431766d08',
            clientSecret: 'ff66cbecb431f56d471aa76075246489da7851fa',
            repo: 'Blogs.github.io',
            owner: 'zy-github-user',
            admin: ['zy-github-user'],
            id: hex_md5(window.location.pathname + window.location.hash.split('?')[0]),
            distractionFreeMode: true
        });
        // console.log(gitalk.id) 
        // console.log(gitalk)
        console.log("new gitalk")
    });
}
//
$docsify.plugins = [].concat(lablegen, $docsify.plugins);
