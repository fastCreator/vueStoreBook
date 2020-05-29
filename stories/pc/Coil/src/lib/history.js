import { equalObj, deepClone } from './utils'

export default {
  data () {
    return {
      historyI: 0,
      history: [{ blocks: [], selectedI: -1 }],
    }
  },
  methods: {
    addHistory () {
      const data = this.blocks
      if (equalObj(data, this.history[this.historyI])) {
        return false
      }
      let blocks = deepClone(data)
      this.history = this.history.slice(0, this.historyI + 1)
      this.history.push({
        blocks, selectedI: this.selectedI
      })
      this.historyI++
    },
    preHistory () {
      if (this.historyI > 0) {
        this.historyI--
        return deepClone(this.history[this.historyI])
      }
    },
    nextHistory () {
      if (this.historyI < this.history.length - 1) {
        this.historyI++
        return deepClone(this.history[this.historyI])
      }
    }
  }
}