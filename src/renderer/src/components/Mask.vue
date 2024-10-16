<script setup lang="ts">

import {onBeforeUnmount, onMounted, ref} from "vue";
import {clamp} from "../scripts/Utils";

const maskDiv = ref<HTMLDivElement>(null)
const pieceNum = 14
const angleStep = 360.0 / pieceNum

const pieces = new Array<Array<HTMLDivElement>>()
const colors = new Array<number>()
const colorStep = 5
const minValue = 0
const maxValue = 200

let timer: NodeJS.Timeout | null = null
let frames: number = 0
let cursor: number = 0

const update = () => {
  if (frames % 3 === 0) {
    colors[cursor] = minValue
  }

  for (let i = 0; i < pieces.length; i++) {
    if (i === cursor) continue
    if (colors[i] < maxValue) {
      // 计算颜色
      colors[i] = clamp(colors[i] + colorStep, minValue, maxValue)
      // 应用颜色
      for (let j = 0; j < pieces[i].length; j++) {
        pieces[i][j].style.backgroundColor = `rgb(${colors[i]},${colors[i]},${colors[i]})`
      }
    }
  }

  if (frames % 3 === 0) {
    cursor = (cursor + 1) % pieceNum
  }

  frames++
}

onMounted(() => {
  const elements = document.getElementsByClassName("piece")
  for (const e of elements) {
    const children = new Array<HTMLDivElement>()
    for (const child of e.children) {
      children.push(child as HTMLDivElement)
    }
    pieces.push(children)
    colors.push(maxValue)
  }
  cursor = 0
  colors[cursor] = minValue
  timer = setInterval(update, 20)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})

</script>

<template>
  <div class="container">
    <div class="mask" ref="maskDiv">
      <div class="piece" v-for="i in pieceNum" :key="i" :id="`${i}`" :style="`transform: rotate(${i * angleStep}deg)`">
        <div class="circle1"></div>
        <div class="rectangle"></div>
        <div class="circle2"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: none;
  z-index: 10;
}

.mask {
  position: relative;
  width: 100%;
  height: 100%;
}

.circle1 {
  margin-bottom: -7px;
  background-color: rgb(200, 200, 200);
  border-radius: 50%;
  width: 14px;
  height: 14px;
}

.rectangle {
  width: 14px;
  height: 32px;
  background-color: rgb(200, 200, 200);
  border-radius: 10%;
}

.circle2 {
  margin-top: -7px;
  background-color: rgb(200, 200, 200);
  border-radius: 50%;
  width: 14px;
  height: 14px;
}

.piece {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: center 110px;

  position: absolute;
  top: calc(50% - 100px);
  left: calc(50% - 7px);
}
</style>
