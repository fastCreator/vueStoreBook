<template>
  <mt-cell :title="label" value="说明文字">
    <mt-switch :value.sync="value"></mt-switch>
  </mt-cell>
</template>

<script>
import 'mint-ui/lib/style.css'
import { Switch, Cell } from 'mint-ui'

export default {
  name: 'mtpand-switch',
  components: {
    mtSwitch: Switch,
    mtCell: Cell
  },
  props: {
    /**
     * 标题
    */
    label: {
      required: true
    }
  },
  data () {
    return {
      items: []
    }
  },
  methods: {
    /**
     * Sets the order
     *
     * @public
     * @version 1.0.5
     * @since Version 1.0.1
     * @param {string} key Key to order
     * @returns {string} Test
     */
    sortBy: function (key) {
      this.sortKey = key
      this.sortOrders[key] = this.sortOrders[key] * -1

      /**
       * Success event.
       *
       * @event success
       * @type {object}
       */
      this.$emit('success', {
        demo: 'example'
      })
    }
  }
}
</script>
