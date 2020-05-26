window.$docsify = {
  //...
  el: '#app', // 指定docsify负责的div id
  loadSidebar: true, // true 定制侧边栏，关闭默认的. false 使用默认
  subMaxLevel: 4, // 目录级别
  loadNavbar: true, // 导航栏
  coverpage: true, // 封面
  onlyCover: true, // 只显示封面，不显示文章
  auto2top: true, //  切换页面自动顶部

  autoHeader: true,

  alias: {
    '/post/_sidebar.md': '/_sidebar.md',
    '/.*/_navbar.md': '/_navbar.md'
  },

  //logo: 'http://avatars2.githubusercontent.com/u/35095041',
  name: 'kirito',

  repo: 'https://github.com/zshorz', // 右上角github链接

  ergeNavbar: true, //小屏设备合并导航栏到侧边栏 
  notFoundPage: true, // 在找不到指定页面时加载 _404.md


  // 搜索插件配置参数
  search: {
    maxAge: 86400000, // 过期时间，单位毫秒，默认一天
    paths: 'auto', // [...] or 'auto'
    placeholder: '搜索',
    noData: '找不到结果',
    // 搜索标题的最大层级, 1 - 6
    depth: 4
  }
}

