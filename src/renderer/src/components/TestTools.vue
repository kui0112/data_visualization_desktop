<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as service from '../scripts/Service'
// import { useRouter } from 'vue-router'
// import { eventbus } from '../scripts/Utils'

// const router = useRouter()
const object_names = ref<Array<string>>([])

onMounted(async () => {
  object_names.value = await service.objectNames()
})
</script>

<template>
  <div>
    <!--    <div v-if="router.currentRoute.value.name === 'Pictures'">-->
    <!--      <div>打字机/普通</div>-->
    <!--      <div style="margin-top: 10px;">-->
    <!--        <a-button @click="eventbus.emit('Pictures:subtitleMode', 'typewriter')">typewriter</a-button>-->
    <!--        <a-button @click="eventbus.emit('Pictures:subtitleMode', 'plain')">plain</a-button>-->
    <!--      </div>-->
    <!--      <div>图片/视频/混合</div>-->
    <!--      <div style="margin-top: 10px;">-->
    <!--        <a-button @click="eventbus.emit('Pictures:contentMode', 'image')">image</a-button>-->
    <!--        <a-button @click="eventbus.emit('Pictures:contentMode', 'video')">video</a-button>-->
    <!--        <a-button @click="eventbus.emit('Pictures:contentMode', 'mix')">mix</a-button>-->
    <!--      </div>-->
    <!--    </div>-->
    <div style="margin-top: 10px;">切换object</div>
    <ul style="list-style-type: circle; margin-top: 10px;">
      <li>
        <a id="{{object_name}}" href="javascript:void(0);" @click="service.updateDisplay('nothing',0)">nothing</a>
      </li>
      <li v-for="object_name in object_names">
        <a href="javascript:void(0);" @click="service.updateDisplay(object_name,1)">{{ object_name }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">

</style>
