<script setup lang="ts">
</script>

<template>
  <div class="container">
    <div class="mask" ref="maskDiv">
      <div class="breathing-texts">
        <div class="breathing-text">请选择一个物体，放置于展台中央</div>
        <div class="breathing-text">Pick one object and place it at the center of the plinth</div>
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

  display: flex;
  align-items: center;

  .breathing-texts {
    width: 100%;
    height: 80px;

    .breathing-text {
      text-align: center;
      font-family: Alibaba-Regular, Sans-serif, serif;
      font-size: 35px;
      animation: breathing 5.2s ease-in-out infinite;
      opacity: 0.20;
    }
  }
}

@keyframes breathing {
  0% {
    opacity: 0.20;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity:  0.20;
  }
}
</style>
