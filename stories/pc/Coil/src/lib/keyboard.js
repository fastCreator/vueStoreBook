import {
  getShapeInfo
} from './shape'

import { deepClone } from './utils'

export default {
  data () {
    return {
      keyStatus: {},
    }
  },
  methods: {
    onlyKey (k) {
      for (let key in this.keyStatus) {
        if (k === key && !this.keyStatus[key]) {
          return false
        }
        if (k !== key && this.keyStatus[key]) {
          return false
        }
      }
      return true
    },
    handlerKeydown (e) {

      const { key } = e
      const Alt = this.keyStatus.Alt
      const Control = this.keyStatus.Control
      this.keyStatus[key] = true

      if (this.onlyKey('Alt') && !Alt) {
        this.$copy()
        this.$paste()
      }
      if (this.onlyKey('Control') && !Control) {
        const block = this.blocks[this.selectedI]
        if (!block) {
          return
        }
        const { w, h } = getShapeInfo(block.paths)
        this.CtlWDH = w / h
        return
      }
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
          this.$blockMove(key)
        } else if (key === 'd') {
          this.$del()
        } else if (key === 'c') {
          this.$copy()
        } else if (key === 'x') {
          this.$cut()
        } else if (key === 'v') {
          this.$paste()
        } else if (key === '-') {
          this.$zoomOut()
        } else if (key === '=') {
          this.$zoomIn()
        } else if (['1','2','3','4'].indexOf(key) > -1 && key<=this.ctrln.length) {
          const type = this.ctrln[key-1]
          this.$setState(type)
          this.$emit('selectTool',type)
        }
        e.stopPropagation()
        event.preventDefault()
        return
      }
      if (this.mouseData) {
        if (key === 'Shift') {
          this.changeBlockStatus('square', true)
        }
        return
      }
    },
    handlerKeyup (e) {
      const { key } = e
      this.keyStatus[key] = false
      if (key === 'Meta' || key === 'Control' || key === 'Alt') {
        this.addHistory() // 对于所有控制添加历史记录
      } else if (key === 'Shift') {
        this.changeBlockStatus('square', false)
      }
    },
    listeKeyboard () {
      window.addEventListener('keydown', this.handlerKeydown)
      window.addEventListener('keyup', this.handlerKeyup)
    },
    removeKeyboard () {
      window.removeEventListener('keydown', this.handlerKeydown)
      window.removeEventListener('keyup', this.handlerKeyup)
    },
    $del () {
      if (this.selectedI >= 0) {
        this.blocks.splice(this.selectedI, 1)
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
      }
    },
    $redu () {
      this.$setBlocks(this.preHistory())
    },
    $unRedu () {
      this.$setBlocks(this.nextHistory())
    }
  },
  mounted () {
    this.listeKeyboard()
  },
  beforeDestroy () {
    this.removeKeyboard()
  }
}