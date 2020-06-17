import { deepClone } from './utils'
import {
  moveDirec,
  dragRactHorn,
  dragRactHornRate,
  dragRactHornRotate
} from './shape'
export default {
  data () {
    return {
      mouseData: null
    }
  },
  methods: {
    handlerRotate (e, i) {
      const block = this.blocks[i]
      const { paths } = this.blocks[i]
      const rect = e.target.parentNode.parentNode.children[0]
      const box = rect.getBoundingClientRect()
      this.mouseData = {
        rotate: true,
        i,
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
      }
    },
    handlerMousedown (e, i, j) {
      const block = this.blocks[i]
      if (j === 0 && block.type === 'polygon') {
        this.blocks[i].waitClose = false
        return false
      }
      this.$selecteBlock({ i })
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
      }
      this.addHistory()
      this.mouseData = null
    },
    handlerMousemove (e) {
      if (this.mouseData) {
        const { x, y, oPaths, i, j, rotate } = this.mouseData
        const { clientX, clientY } = e
        const block = this.blocks[i]
        const { type, paths } = block
        const mx = clientX - x
        const my = clientY - y

        if (rotate) {
          let rotate
          if (my < 0) {
            rotate = Math.atan(-mx / my) * 180 / Math.PI
          } else {
            rotate = Math.atan(-mx / my) * 180 / Math.PI + 180
          }
          block.rotate = rotate
          return false
        } else if (j !== undefined) { // 拖动脚
          const px = oPaths[j][0]
          const py = oPaths[j][1]
          const ex = mx + px
          const ey = my + py
          // 多边形
          if (type === 'polygon') {
            paths[j] = [ex, ey]
          } else {
            if (this.keyStatus.Control && this.CtlWDH) {
              dragRactHornRate(paths, j, { wDh: this.CtlWDH, mx, my, px, py })
            } else {
              block.paths = dragRactHornRotate(paths, j * 2, { ex: clientX - this.rx, ey: clientY - this.ry }, block.rotate)
            }
          }
        } else { // 整体拖动
          block.paths = moveDirec(oPaths, [mx, my])
        }
        this.$forceUpdate()
        e.stopPropagation()
      }
    },
    listeMouseUp () {
      window.addEventListener('mouseup', this.handlerMouseup)
    }
  },
  mounted () {
    this.listeMouseUp()
  },
  beforeDestroy () {
    window.removeEventListener('mouseup', this.handlerMouseup)
  }
}