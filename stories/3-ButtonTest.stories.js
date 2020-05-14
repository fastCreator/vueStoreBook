import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import { storiesOf } from '@storybook/vue'
import { withKnobs, text, boolean } from '@storybook/addon-knobs'

import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks'

import MyButton from './MyButton'

export default {
  title: 'ButtonTest',
  component: MyButton,
  parameters: {
    docs: {
      container: DocsContainer,
      page: DocsPage
    }
  }
}

export const Text = () => ({
  components: { MyButton },
  template: '<my-button @click="action">Hello Button</my-button>',
  methods: { action: action('clicked') }
})

export const Jsx = () => ({
  components: { MyButton },
  render (h) {
    return <my-button onClick={this.action}>With JSX</my-button>
  },
  methods: { action: linkTo('clicked') }
})

export const Emoji = () => ({
  components: { MyButton },
  template: '<my-button @click="action">😀 😎 👍 💯</my-button>',
  methods: { action: action('clicked') }
})

export const exampleWithKnobs = () => ({
  components: { MyButton },
  props: {
    isDisabled: {
      default: boolean('Disabled', false)
    },
    text: {
      default: text('Text', 'Hello Storybook')
    }
  },
  template: `<MyButton :isDisabled="isDisabled">{{ text }}</MyButton>`
})
