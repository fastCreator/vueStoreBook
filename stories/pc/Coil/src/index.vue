<template>
  <svg
    class="coil"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    :width="width"
    :height="height"
    @mousedown="drawBlock"
    @mousemove="handlerMousemove"
    :style="{backgroundImage:`url(${src})`}"
  >
    <g
      class="block"
      v-bind="pathAttrs"
      v-for="(it, i) in blocks"
      :fill="fillBlock(it)"
      :key="it.key"
    >
      <template v-if="it.type === 'dot'">
        <circle
          v-bind="dotAttrs.circle"
          :cx="it.paths[0]"
          :cy="it.paths[1]"
        ></circle>
        <text
          v-bind="dotAttrs.text"
          :x="it.paths[0]"
          :y="it.paths[1]+1"
          text-anchor="middle"
          dominant-baseline="middle"
        >{{i+1}}</text>
      </template>
      <ellipse
        v-else-if="it.type === 'ellipse'"
        v-bind="getEllipsePath(it)"
        @mousedown.stop="handlerMousedown($event, i)"
      />
      <path
        v-else
        @mousedown.stop="handlerMousedown($event, i)"
        :d="getRectPath(it)"
      />
      <g v-if="selectedI === i && it.type!=='dot'">
        <rect
          v-for="(jt, j) in getShowPath(it)"
          :x="jt[0] - rectAttrs.width / 2"
          :y="jt[1] - rectAttrs.height / 2"
          :key="`${i},${j}`"
          v-bind="rectAttrs"
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

import { deepClone } from './lib/utils'

import history from './lib/history'
import keyboard from './lib/keyboard'
import mouse from './lib/mouse'

export default {
  name: 'Coil',
  props: {
    dotAttrs: {
      default: () => ({
        circle: {
          stroke: 'none',
          strokeWidth: 0,
          fill: 'red',
          r: 8
        },
        text: {
          fill: 'black',
          'font-size': '10px'
        }
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
  mixins: [history, keyboard, mouse],
  data () {
    return {
      width: 0,
      height: 0,
      key: 0,
      selectedI: null,
      blocks: [],
      copyBlock: null,
      state: null,
    }
  },
  methods: {
    fillBlock (block) {
      if (!block.waitClose || block.type !== 'polygon') {
        return this.pathAttrs.fill
      } else {
        return 'none'
      }
    },
    drawBlock (e) {
      const type = this.state
      const { offsetX, offsetY } = e
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
    $addBlock (type, paths, data) {
      this.blocks.push({ key: this.key++, type, paths, ...data })
      this.selectedI = this.blocks.length - 1
    },
    // 模块上下左右移动
    $blockMove (direc) {
      const block = this.blocks[this.selectedI]
      if (block && block.paths) {
        const { paths } = block
        block.paths = moveDirec(paths, DirecLenMap(direc))
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
        block.paths.push([e.offsetX, e.offsetY])
      }
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
  .block {
    rect {
      cursor: pointer;
    }
  }
}
</style>
