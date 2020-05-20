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
    changeBlockStatus (type, bool) {
      const block = this.blocks[this.selectedI]
      if (block) {
        block[type] = bool
        this.$forceUpdate()
      }
    },
    endBlockStatus (type) {
      const block = this.blocks[this.selectedI]
      if (block && block[type]) {
        if (type === 'square') {
          block.paths = sqre2rect(block.paths, this.mouseData.j)
        }
        this.$forceUpdate()
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
    $addBlock (type, paths) {
      this.blocks.push({ key: Date.now(), type, paths })
      this.addHistory()
    },
    blockMove (direc) {
      const block = this.blocks[this.selectedI]
      if (block && block.paths) {
        const { paths } = block
        const moveI = Number(direc === 'ArrowUp' || direc === 'ArrowDown')
        const moveN = direc === 'ArrowUp' || direc === 'ArrowLeft' ? -1 : 1
        paths.forEach(it => {
          it[moveI] += moveN
        })
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
      return `M${paths
        .reduce((a, b) => `${a} L${b[0]} ${b[1]}`, '')
        .slice(2)} Z`
    },
    getEllipsePath ({ paths, square, type }) {
      paths = this.getShowPath({ paths, square, type })
      const p1 = paths[0]
      const p2 = paths[2]
      const cx = (p1[0] + p2[0]) / 2
      const cy = (p1[1] + p2[1]) / 2
      const rx = Math.abs(p1[0] - p2[0]) / 2
      const ry = Math.abs(p1[1] - p2[1]) / 2
      return { cx, cy, rx, ry }
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
          if (type === 'polygon') {
            paths[j] = [ex, ey]
          } else {
            const preJ = getBN(j - 1)
            const dJ = getBN(j + 2)
            const nextJ = getBN(j + 1)
            if (isOdd(paths, j)) {
              paths[preJ] = [ex, paths[dJ][1]]
              paths[j] = [ex, ey]
              paths[nextJ] = [paths[dJ][0], ey]
            } else {
              paths[preJ] = [paths[dJ][0], ey]
              paths[j] = [ex, ey]
              paths[nextJ] = [ex, paths[dJ][1]]
            }
          }
        } else {
          block.paths = oPaths.map(it => [mx + it[0], my + it[1]])
        }
        this.$forceUpdate()
        e.stopPropagation()
      }
    },
    polygonAddPath (e) {
      const block = this.blocks[this.selectedI]
      if (block && block.type === 'polygon') {
        block.paths.push([e.offsetX, e.offsetY])
      }
    },
    handlerClick (e) {
      if (e.target.tagName === 'svg') {
        this.polygonAddPath(e)
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
function deepClone (o) {
  return JSON.parse(JSON.stringify(o))
}

// 长方形形变正方
function sqre2rect (paths, i) {
  i = getBN(i + 2)
  const v = paths[i]
  const arrX = paths.map(it => it[0])
  const arrY = paths.map(it => it[1])
  const minX = Math.min.apply(null, arrX)
  const minY = Math.min.apply(null, arrY)
  const maxX = Math.max.apply(null, arrX)
  const maxY = Math.max.apply(null, arrY)
  const min = Math.min(minX, minY)
  const max = Math.max(maxX, maxY)
  const d = Math.max(maxX - minX, maxY - minY)

  if (v[0] === minX && v[1] === minY) {
    return [
      [v[0], v[1]],
      [v[0] + d, v[1]],
      [v[0] + d, v[1] + d],
      [v[0], v[1] + d]
    ]
  }
  if (v[0] === minX && v[1] === maxY) {
    return [
      [v[0], v[1] - d],
      [v[0], v[1]],
      [v[0] + d, v[1]],
      [v[0] + d, v[1] - d]
    ]
  }
  if (v[0] === maxX && v[1] === maxY) {
    return [
      [v[0] - d, v[1] - d],
      [v[0] - d, v[1]],
      [v[0], v[1]],
      [v[0], v[1] - d]
    ]
  }

  return [
    [v[0] - d, v[1]],
    [v[0] - d, v[1] + d],
    [v[0], v[1] + d],
    [v[0], v[1]]
  ]
}
// 一大一小为中间
function isOdd (paths, j) {
  const block = paths[j]
  const arrX = paths.map(it => it[0])
  const arrY = paths.map(it => it[1])
  const minX = Math.min.apply(null, arrX)
  const minY = Math.min.apply(null, arrY)
  const maxX = Math.max.apply(null, arrX)
  const maxY = Math.max.apply(null, arrY)
  if (
    (block[0] === minX && block[1] === maxY) ||
    (block[0] === maxX && block[1] === minY)
  ) {
    return true
  }
}

function getBN (n, m = 4) {
  return (n + 4) % 4
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
