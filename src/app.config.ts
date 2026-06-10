export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/hazard/index',
    'pages/inspect/index',
    'pages/message/index',
    'pages/mine/index',
    'pages/hazard/report/index',
    'pages/hazard/detail/index',
    'pages/inspect/check/index',
    'pages/equipment/index',
    'pages/rectify/index',
    'pages/training/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '消防管理',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#E8553A',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/hazard/index', text: '隐患' },
      { pagePath: 'pages/inspect/index', text: '巡检' },
      { pagePath: 'pages/message/index', text: '消息' },
      { pagePath: 'pages/mine/index', text: '我的' }
    ]
  }
})
