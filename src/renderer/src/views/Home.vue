<script setup lang="ts">
import { eventbus } from '../scripts/EventBus'

const openDevTools = () => {
  eventbus.emit('openDevTools')
}

const closeDevTools = () => {
  eventbus.emit('closeDevTools')
}

const openNav = () => {
  eventbus.emit('openNav')
}

const closeNav = () => {
  eventbus.emit('closeNav')
}

</script>

<template>
  <div style="text-align: center; height: 100%">
    <div style="margin-top: 10px">
      welcome.
    </div>

    <div style="margin-top: 20px">
      <a-space direction="vertical">
        <a-space>
          <a-button @click="openDevTools">打开 dev tools</a-button>
          <a-button @click="closeDevTools">关闭 dev tools</a-button>
        </a-space>
        <a-space>
          <a-button @click="openNav">打开 Nav</a-button>
          <a-button @click="closeNav">关闭 Nav</a-button>
        </a-space>
      </a-space>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
