<template>
  <svg
    class="coil"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    :width="width"
    :height="height"
    @mousemove="handlerMousemove"
    @click="handlerClick"
  >
    <g
      class="block"
      v-bind="pathAttrs"
      v-for="(it, i) in blocks"
      :key="it.key"
    >
      <ellipse
        v-if="it.type === 'ellipse'"
        v-bind="getEllipsePath(it)"
        @mousedown="handlerMousedown($event, i)"
      />
      <path
        v-else
        @mousedown="handlerMousedown($event, i)"
        :d="getRectPath(it)"
      />
      <g v-if="selectedI === i">
        <rect
          v-for="(jt, j) in getShowPath(it)"
          :x="jt[0] - rectAttrs.width / 2"
          :y="jt[1] - rectAttrs.height / 2"
          :key="`${i},${j}`"
          v-bind="rectAttrs"
          :class="jt.join(',') + it.square + j"
          @mousedown="handlerMousedown($event, i, j)"
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
    pathAttrs: {
      default: () => ({
        stroke: '#cccccc',
        strokeWidth: 1,
        fill: 'rgba(25,225,100,0.5)'
      })
    },
    rectAttrs: {
      default: () => ({
        width: 10,
        height: 10,
        style: 'fill:rgb(0,0,255);stroke-width:1;stroke:rgb(0,0,0)'
      })
    },
    width: {
      default: '100%'
    },
    height: {
      default: '100%'
    }
  },
  mixins: [history, keyboard, mouse],
  data () {
    return {
      key: 0,
      selectedI: null,
      blocks: [],
      copyBlock: null
    }
  },
  methods: {
    // 设置当前所有展示
    $setBlocks (blocks) {
      if (blocks) {
        this.blocks = blocks
      }
    },
    // 添加一个块
    $addBlock (type, paths) {
      this.blocks.push({ key: this.key++, type, paths })
      this.addHistory()
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
    handlerClick (e) {
      if (e.target.tagName === 'svg') {
        this.addHorn(e)
      }
    }
  },
  async created () { },
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
