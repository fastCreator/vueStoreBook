<template>
  <svg
    class="coil"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    :width="width"
    :height="height"
    @mousedown="drawBlock"
    @mousemove="handlerMousemove"
    :style="{backgroundImage:`url(${src})`,zoom:zoom}"
  >
    <g
      class="block"
      v-bind="pathAttrs"
      v-for="(it, i) in blocks"
      :fill="fillBlock(it)"
      :key="it.key"
    >
      <circle
        v-if="it.type === 'dot'"
        v-bind="dotAttrs"
        :cx="it.paths[0]"
        :cy="it.paths[1]"
        :r="dotAttrs.r/zoom"
      ></circle>
      <ellipse
        :style="getRoateStyle(it)"
        v-else-if="it.type === 'ellipse'"
        v-bind="getEllipsePath(it)"
        @mousedown.stop="handlerMousedown($event, i)"
      />
      <path
        v-else
        :style="getRoateStyle(it)"
        @mousedown.stop="handlerMousedown($event, i)"
        :d="getRectPath(it)"
      />
      <text
        v-if="it.type === 'dot'"
        v-bind="textAttrs"
        :font-size="textAttrs.fontSize /zoom + 'px'"
        :x="it.paths[0]"
        :y="it.paths[1]"
        text-anchor="middle"
        dominant-baseline="middle"
      >{{i+1}}</text>
      <text
        v-else
        v-bind="textAttrs"
        :font-size="textAttrs.fontSize /zoom + 'px'"
        :x="coordinateX(it)+4"
        :y="coordinateY(it)+4"
        :style="getRoateStyle(it)"
        text-anchor="start"
        dominant-baseline="hanging"
      >{{i+1}}</text>
      <g v-if="selectedI === i && it.type!=='dot'" :style="getRoateStyle(it)">
        <image v-if="it.type==='ellipse' || it.type==='rect'" @mousedown.stop="handlerRotate($event, i)" class="rotate" :x="(it.paths[0][0] + it.paths[2][0])/2 -10/zoom" :y="it.paths[0][1]-30/zoom" :width="20/zoom" :height="20/zoom" xlink:href="./img/rotate.png"/>
        <rect
          v-for="(jt, j) in getShowPath(it)"
          v-bind="rectAttrs"
          :x="jt[0] - rectAttrs.width / 2 / zoom"
          :y="jt[1] - rectAttrs.height / 2 / zoom"
          :width="rectAttrs.width / zoom"
          :height="rectAttrs.height / zoom"
          :key="`${i},${j}`"
          :class="jt.join(',') + it.square + j"
          @mousedown.stop="handlerMousedown($event, i, j)"
        ></rect>
      </g>
    </g>
  </svg>
</template>

<script>
import {
  getRectPath,
  getEllipsePath,
  sqre2rect,
  moveDirec,
  dragRactHorn,
  DirecLenMap
} from './lib/shape'
import {rotateIcon} from './icon'
import { deepClone } from './lib/utils'

import history from './lib/history'
import keyboard from './lib/keyboard'
import mouse from './lib/mouse'
const defaultdata = ()=>null
export default {
  name: 'Coil',
  props: {
    defaultdata:{
      type: Function,
      default: defaultdata
    },
    value:{
      default:()=>[]
    },
    ctrln:{
      default:()=>['polygon','rect','ellipse','dot']
    },
    dotAttrs: {
      default: () => ({
        stroke: 'none',
        strokeWidth: 0,
        fill: 'red',
        r: 8
      })
    },
    textAttrs: {
      default: () => ({
        stroke: 'transparent',
        fill: 'black',
        fontSize: 12
      })
    },
    pathAttrs: {
      default: () => ({
        stroke: 'rgb(178,174,171)',
        strokeWidth: 1,
        fill: 'rgba(255,225,255,0.4)'
      })
    },
    rectAttrs: {
      default: () => ({
        width: 8,
        height: 8,
        style: 'fill:rgb(255,255,255);stroke-width:1;stroke:rgb(0, 0, 0)'
      })
    },
    src: {
      required: true
    }
  },
  watch:{
    blocks:{
      handler(v){
        this.$emit('changeBlocks',v)
      },
      deep:true
    }
  },
  mixins: [history, keyboard, mouse],
  data () {
    return {
      rotateIcon,
      zoom:1,
      width: 0,
      height: 0,
      key: 0,
      selectedI: null,
      blocks: this.value,
      copyBlock: null,
      state: null,
    }
  },
  methods: {
    // 获取旋转值
    getRoateStyle(it){
      if(it.type === 'ellipse' || it.type === 'rect'){
        return `transform: rotate(${it.rotate}deg);transform-origin:${(it.paths[0][0] + it.paths[2][0])/2}px ${(it.paths[0][1] + it.paths[2][1])/2}px`
      }
    },
    // 放大
    $zoomIn(){
      this.zoom*=1.1
    },
    // 缩小
    $zoomOut(){
      this.zoom*=0.9
    },
    fillBlock (block) {
      if (!block.waitClose || block.type !== 'polygon') {
        return this.pathAttrs.fill
      } else {
        return 'none'
      }
    },
    drawBlock (e) {
      const type = this.state
      let { offsetX, offsetY } = e
      offsetX/=this.zoom
      offsetY/=this.zoom
      if (type === 'rect' || type === 'ellipse') {
        this.$addBlock(this.state, [[offsetX, offsetY], [offsetX, offsetY], [offsetX, offsetY], [offsetX, offsetY]])
        const i = this.blocks.length - 1
        this.handlerMousedown(e, i, 2)
      } else if (type === 'polygon') {
        const block = this.blocks[this.blocks.length - 1]
        if (block && block.waitClose) {
          this.addHorn(e)
        } else {
          this.$addBlock(this.state, [[offsetX, offsetY]], { waitClose: true })
        }
      } else if (type === 'dot') {
        this.$addBlock(this.state, [offsetX, offsetY])
      }
    },
    $setState (state) {
      this.state = state
      if(state !== 'polygon'){
        let len = this.blocks.length
        for(let i =0;i<len;i++){
          if(this.blocks[i].waitClose){
            this.blocks.splice(i,1)
            i--
            len--
          }
        }
      }
    },
    loadImg () {
      const img = new Image()
      img.src = this.src
      img.onload = (e) => {
        this.width = img.width
        this.height = img.height
      }
    },
    // 设置当前所有展示
    $setBlocks (history) {
      if (!history) {
        return false
      }
      const { blocks, selectedI } = history
      if (blocks) {
        this.blocks = blocks
      }
      this.selectedI = selectedI
    },
    // 添加一个块
    $addBlock (type, paths, _data) {
      const data = this.defaultdata({type, paths, _data})
      this.blocks.push({ key: this.key++, type, paths, ..._data,data,rotate:0 })
      this.selectedI = this.blocks.length - 1
    },
    // 模块上下左右移动
    $blockMove (direc) {
      const block = this.blocks[this.selectedI]
      if (block && block.paths) {
        const { paths } = block
        block.paths = moveDirec(paths, DirecLenMap[direc])
        this.$forceUpdate()
      }
    },
    // 设置当前选中模块
    $selecteBlock ({ i, key }) {
      this.selectedI = i
    },
    // 改变图形状态
    changeBlockStatus (type, bool) {
      const block = this.blocks[this.selectedI]
      if (block && block.type !== "polygon") {
        block[type] = bool
        this.$forceUpdate()
      }
    },
    // 结束图形状态
    endBlockStatus (type) {
      const block = this.blocks[this.selectedI]
      if (block && block[type]) {
        if (type === 'square') {
          block.paths = sqre2rect(block.paths, this.mouseData.j)
        }
        this.$forceUpdate()
      }
    },
    getShowPath ({ paths, square, type }) {
      if (square && type !== 'polygon' && this.mouseData) {
        return sqre2rect(paths, this.mouseData.j)
      }
      return paths
    },
    getRectPath ({ paths, square, type }) {
      paths = this.getShowPath({ paths, square, type })
      return getRectPath({ paths, square, type })
    },
    getEllipsePath ({ paths, square, type }) {
      paths = this.getShowPath({ paths, square, type })
      return getEllipsePath({ paths, square, type })
    },

    addHorn (e) {
      const block = this.blocks[this.selectedI]
      if (block && block.type === 'polygon') {
        block.paths.push([e.offsetX/this.zoom, e.offsetY/this.zoom])
      }
    },
    coordinateX ({ paths, type }) {
      if(type === 'polygon'){
        return paths[0][0]
      }
      const arrX = paths.map(it => it[0])
      return Math.min.apply(null, arrX)
    },
    coordinateY ({ paths, type }) {
      if(type === 'polygon'){
        return paths[0][1]
      }
      const arrY = paths.map(it => it[1])
      return Math.min.apply(null, arrY)
    },
    // handlerClick (e) {
    //   if (e.target.tagName === 'svg') {
    //     this.addHorn(e)
    //   }
    // }
  },
  beforeCreate () {
  },
  async created () {
    this.loadImg()
  },
  mounted () {
    
  }
}
</script>

<style lang="less">
.coil {
  user-select: none;
  .icon-roate{
    
  }
  .block {
    rect {
      cursor: pointer;
    }
  }
  .rotate{
    cursor: -webkit-grab;
  }
}
</style>
