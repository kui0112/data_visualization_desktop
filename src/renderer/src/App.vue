<script setup lang="ts">
import Nav from './components/Nav.vue'
import { onMounted, ref } from 'vue'
import TestTools from './components/TestTools.vue'

const navDiv = ref<HTMLDivElement | null>(null)
const routerViewDiv = ref<HTMLDivElement | null>(null)
const testTools = ref<HTMLDivElement | null>(null)

function hideNavAndTestTool(): void {
  if (navDiv.value) {
    navDiv.value.style.display = 'none'
  }
  if (routerViewDiv.value) {
    routerViewDiv.value.style.width = '100%'
    routerViewDiv.value.style.height = '100%'
  }
  if (testTools.value) {
    testTools.value.style.display = 'none'
  }
}

function showNavAndTestTool(): void {
  if (navDiv.value) {
    navDiv.value.style.display = 'flex'
  }
  if (routerViewDiv.value) {
    routerViewDiv.value.style.width = '80%'
    routerViewDiv.value.style.height = '90%'
  }
  if (testTools.value) {
    testTools.value.style.display = 'block'
  }
}

onMounted(() => {
  // @ts-ignore
  window.api.onFullScreenStateChange((fullscreen: boolean) => {
    if (fullscreen) {
      hideNavAndTestTool()
    } else {
      showNavAndTestTool()
    }
  })
})
</script>

<template>
  <div ref="navDiv" class="nav">
    <Nav></Nav>
  </div>
  <div ref="routerViewDiv" class="router-view">
    <router-view></router-view>
  </div>
  <div ref="testTools" class="test-tools">
    <TestTools></TestTools>
  </div>
</template>

<style lang="less" scoped>
.nav {
  width: 100%;
  height: 5%;
  display: flex;
  align-items: center;
}

.router-view {
  width: 80%;
  height: 90%;
  float: left;
  overflow: hidden;
}

.test-tools {
  width: 20%;
  height: 95%;
  float: right;
}
</style>