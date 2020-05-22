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
    <g class="block" v-bind="pathAttrs" v-for="(it, i) in blocks" :key="it.key">
      <ellipse
        v-if="it.type === 'ellipse'"
        v-bind="getEllipsePath(it)"
        @click="selecteBlock(i)"
        @mousedown="handlerMousedown($event, i)"
      />
      <path
        v-else
        :d="getRectPath(it)"
        @click.stop="selecteBlock(i)"
        @mousedown="handlerMousedown($event, i)"
      />
      <rect
        v-if="selectedI === i"
        v-for="(jt, j) in getShowPath(it)"
        :x="jt[0] - rectAttrs.width / 2"
        :y="jt[1] - rectAttrs.height / 2"
        :key="jt.join(',')"
        v-bind="rectAttrs"
        :class="jt.join(',') + it.square + j"
        @mousedown="handlerMousedown($event, i, j)"
      ></rect>
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
  deepClone,
  DirecLenMap
} from './shape'

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
  data () {
    return {
      keyStatus: {},
      selectedI: null,
      historyI: 0,
      history: [[]],
      blocks: [],
      mouseData: null
    }
  },
  methods: {
    // 操作
    $del () {
      if (this.selectedI >= 0) {
        this.blocks.splice(this.selectedI, 1)
        this.addHistory()
        this.selectedI = -1
      }
    },
    $copy () {
      if (this.selectedI >= 0) {
        this.copyBlock = deepClone(this.blocks[this.selectedI])
      }
    },
    $cut () {
      this.$copy()
      this.$del()
    },
    $paste () {
      if (this.copyBlock) {
        this.blocks.push({ ...this.copyBlock, key: Date.now() })
        this.addHistory()
      }
    },
    $redu () {
      if (this.historyI > 0) {
        this.historyI--
        this.blocks = deepClone(this.history[this.historyI])
      }
    },
    $unRedu () {
      if (this.historyI < this.history.length - 1) {
        this.historyI++
        this.blocks = deepClone(this.history[this.historyI])
      }
    },
    $addBlock (type, paths) {
      this.blocks.push({ key: Date.now(), type, paths })
      this.addHistory()
    },
    addHistory () {
      let strB = JSON.stringify(this.blocks)
      if (JSON.stringify(this.history[this.historyI]) === strB) {
        return false
      }
      let blocks = JSON.parse(strB)
      this.history = this.history.slice(0, this.historyI + 1)
      this.history.push(blocks)
      this.historyI++
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
    // 改变图形状态
    changeBlockStatus (type, bool) {
      const block = this.blocks[this.selectedI]
      if (block) {
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
    //
    blockMove (direc) {
      const block = this.blocks[this.selectedI]
      if (block && block.paths) {
        const { paths } = block
        block.paths = moveDirec(paths, DirecLenMap(direc))
        this.$forceUpdate()
      }
    },
    handlerMousedown (e, i, j) {
      const { paths } = this.blocks[i]
      this.mouseData = {
        x: e.clientX,
        y: e.clientY,
        i,
        j,
        oPaths: deepClone(paths)
      }
    },
    handlerMouseup () {
      if (this.mouseData) {
        this.endBlockStatus('square')
        this.addHistory()
      }
      this.mouseData = null
    },
    selecteBlock (i) {
      this.selectedI = i
    },
    handlerMousemove (e) {
      if (this.mouseData) {
        const { x, y, oPaths, i, j } = this.mouseData
        const { clientX, clientY } = e
        const block = this.blocks[i]
        const { type, paths } = block
        const mx = clientX - x
        const my = clientY - y
        if (j !== undefined) {
          const px = oPaths[j][0]
          const py = oPaths[j][1]
          const ex = mx + px
          const ey = my + py
          // 多边形
          if (type === 'polygon') {
            paths[j] = [ex, ey]
          } else {
            dragRactHorn(paths, j, { ex, ey })
          }
        } else {
          block.paths = moveDirec(oPaths, [mx, my])
        }
        this.$forceUpdate()
        e.stopPropagation()
      }
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
    },
    handlerKeydown (e) {
      const { key } = e
      this.keyStatus[key] = true
      if (this.keyStatus.Meta || this.keyStatus.Control) {
        if (key === 'z') {
          this.$redu()
        } else if (key === 'y') {
          this.$unRedu()
        } else if (
          key === 'ArrowUp' ||
          key === 'ArrowDown' ||
          key === 'ArrowLeft' ||
          key === 'ArrowRight'
        ) {
          this.blockMove(key)
        } else if (key === 'Backspace') {
          this.$del()
        } else if (key === 'c') {
          this.$copy()
        } else if (key === 'x') {
          this.$cut()
        } else if (key === 'v') {
          this.$paste()
        }
        e.stopPropagation()
      } else if (this.mouseData) {
        if (key === 'Shift') {
          this.changeBlockStatus('square', true)
        }
      }
    },
    handlerKeyup (e) {
      const { key } = e
      this.keyStatus[key] = false
      if (key === 'Meta' || key === 'Control') {
        this.addHistory()
      } else if (key === 'Shift') {
        this.changeBlockStatus('square', false)
      }
    },
    listeMouseUp () {
      window.addEventListener('mouseup', this.handlerMouseup)
    },
    listeKeyboard () {
      window.addEventListener('keydown', this.handlerKeydown)
      window.addEventListener('keyup', this.handlerKeyup)
    }
  },
  async created () {},
  mounted () {
    this.listeMouseUp()
    this.listeKeyboard()
    this.$addBlock('polygon', [
      [50, 50],
      [50, 100],
      [100, 100],
      [100, 50]
    ])
    setTimeout(() => {
      this.$addBlock('ellipse', [
        [100, 100],
        [100, 150],
        [150, 150],
        [150, 100]
      ])
    }, 200)
    setTimeout(() => {
      this.$addBlock('rect', [
        [200, 200],
        [200, 300],
        [300, 300],
        [300, 200]
      ])
    }, 20)
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.handlerMouseup)
    window.removeEventListener('keydown', this.handlerKeydown)
    window.removeEventListener('keyup', this.handlerKeyup)
  }
}
</script>
<style>
.coil {
  background-image: url(
    https://dss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3632971942,
    971319411&fm=115&gp=0.jpg
  );
  background-size: 100% 100%;
}
.coil .block rect {
  cursor: pointer;
}
</style>
