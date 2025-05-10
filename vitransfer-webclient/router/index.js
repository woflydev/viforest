import Vue from 'vue'
import Router from 'vue-router'

function isMobile() {
  // return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
  let htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;

  if (flag === null || htmlWidth > 500) {
      return 0;
  } else {
      return 1;
  }
}

const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/vitransfer',
    },
    {
      name:'vitransfer',
      path: '/vitransfer',
      meta:{title:'viwoods'},
      component: () => isMobile()?  import('@/views/wap/vitransfer') :  import('@/views/pc/vitransfer')
    },
    {
      name:"login",
      path: '/vitransfer/login',
      meta:{title:'viwoods'},
      component: () =>isMobile()?  import('@/views/wap/Login') :  import('@/views/pc/Login')
    },
    {
      name:'fileshared',
      path: '/shared/s/:key',
      meta:{title:'viwoods'},
      component: () =>isMobile()?  import('@/views/wap/FileShared') :  import('@/views/pc/FileShared') 
    },
    {
      name:'sharedlist',
      path: '/shared/list',
      meta:{title:'viwoods'},
      component: () =>isMobile()?  import('@/views/wap/SharedList') :  import('@/views/pc/SharedList')
    },
    {
      path: '*',
      redirect: '/vitransfer',
    },
    {
      path: '/404',
      meta:{title:'viwoods'},
      component: () => isMobile()?  import('@/views/wap/vitransfer') :  import('@/views/pc/vitransfer') 
    }
  ]
})