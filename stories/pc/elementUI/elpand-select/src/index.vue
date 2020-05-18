<template>
  <el-select :value="value" v-bind="bind" v-on="on" @input="input">
    <el-option
      v-for="item in items"
      :key="item[optionsProps.value]"
      :label="item[optionsProps.label]"
      :value="item[optionsProps.value]"
    />
  </el-select>
</template>

<script>
import 'element-ui/lib/theme-chalk/index.css'
import { Select, Option } from 'element-ui'
console.log(Select)
export default {
  name: 'elpand-select',
  components: {
    ElSelect: Select,
    ElOption: Option
  },
  props: {
    /**
     * elSelect 属性值
     */
    bind: {
      type: Object,
      default: () => ({})
    },
    /**
     * elSelect 事件
     */
    on: {
      type: Object,
      default: () => ({})
    },
    value: {
      required: true
    },
    /**
     * 选项值
     */
    options: {
      required: true,
      type: [Array, Function],
      default: () => []
    },
    /**
     * options 属性名配置
     */
    optionsProps: {
      type: Object,
      default: () => ({
        label: 'label',
        value: 'value'
      })
    }
  },
  data () {
    return {
      items: []
    }
  },
  methods: {
    input (v) {
      /**
       * Passthrough click event
       * @type {Event}
       *
       */
      this.$emit('input', v)
    },
    /**
     * 图片处理方法
     * @param imgs {Array} 图片集
     * @param [size] {Integer} 尺寸
     * @example Example usage of formatImgUrl.
     * this.formatImgUrl(imgs);
     * @returns {Array}
     */
    test () {}
  },
  async created () {
    if (typeof this.options === 'function') {
      this.items = await this.options()
    } else {
      this.items = this.options
    }
  }
}
</script>
