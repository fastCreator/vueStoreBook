import Component from './index.vue'

Component.install = function (Vue) {
  Vue.component(Component.name, Component)
}

export default Component
