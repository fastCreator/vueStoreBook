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
      :key="it.name"
    >
      <ellipse
        v-if="it.type === 'ellipse'"
        v-bind="getEllipsePath(it.paths)"
        @click="selecteBlock(i)"
        @mousedown="handlerMousedown($event, i)"
      />
      <path
        v-else
        :d="getRectPath(it.paths)"
        @click.stop="selecteBlock(i)"
        @mousedown="handlerMousedown($event, i)"
      />
      <rect
        v-if="selectedI === i"
        v-for="(jt, j) in it.paths"
        :x="jt[0] - rectAttrs.width / 2"
        :y="jt[1] - rectAttrs.height / 2"
        :key="j"
        v-bind="rectAttrs"
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
    $addBlock (name, type, paths) {
      this.blocks.push({ name, type, paths })
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
    getRectPath (paths) {
      return `M${paths
        .reduce((a, b) => `${a} L${b[0]} ${b[1]}`, '')
        .slice(2)} Z`
    },
    getEllipsePath (paths) {
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
            const preJ = j - 1 < 0 ? 3 : j - 1
            const nextJ = j + 1 > 3 ? 0 : j + 1
            if (j % 2) {
              paths[preJ] = [ex, paths[preJ][1]]
              paths[j] = [ex, ey]
              paths[nextJ] = [paths[nextJ][0], ey]
            } else {
              paths[preJ] = [paths[preJ][0], ey]
              paths[j] = [ex, ey]
              paths[nextJ] = [ex, paths[nextJ][1]]
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
        }
      }
    },
    handlerKeyup (e) {
      this.keyStatus[e.key] = false
      if (e.key === 'Meta' || e.key === 'Control') {
        this.addHistory()
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
    this.$addBlock('test1', 'polygon', [
      [50, 50],
      [50, 100],
      [100, 100],
      [100, 50]
    ])
    setTimeout(() => {
      this.$addBlock('test2', 'ellipse', [
        [100, 100],
        [100, 150],
        [150, 150],
        [150, 100]
      ])
    }, 200)
    setTimeout(() => {
      this.$addBlock('test3', 'rect', [
        [200, 200],
        [200, 300],
        [300, 300],
        [300, 200]
      ])
    }, 20)
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.handlerMouseup)
    window.removeEventListener('keydown', this.handlerMouseup)
    window.removeEventListener('keyup', this.handlerMouseup)
  }
}
function deepClone (o) {
  return JSON.parse(JSON.stringify(o))
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
