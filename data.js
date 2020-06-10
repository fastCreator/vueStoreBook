export default {
  background:{}, // {...background}
  components:[
    {
      bind:{
        tag:'group', // 标签名
        ctrl:{ // 相对上一级的位置
          pos:{
            left:'',
            top:'',
          },// 坐标  top值可以写表达式，用来做循环
          box:{},// margin,padding,overflow,
          background:{}, // 背景
          border:{}, // 边框
          transition:{
            transitionDelay:'',
            transitionDuration:'',
          },
          enterTransition:'',
          outerTransition:''
        },
        for:{}, //开启循环模式的时候，再出现一个ctrl-wrap 配置样式  {...border,...background}
        props:{} // 只有组件中的属性可以根据状态绑定数据
      },
      on:[
        {
          event:'click',  // 进入页面、移出页面等事件
          action:'changeState',
          data:{},
        }
      ]
    }
  ],
  methods:[
    {
      note:'', // 注解
      uid:'', //唯一值，自动生成
      function:``,// 函数
    }
  ],
  apis:[
    {
      note:'', // 注解
      uid:'', //唯一值，自动生成
      function:``,// 函数
    }
  ]
}
