<script lang="ts" setup>
import {h, ref} from 'vue'
import {
  HomeOutlined,
  ArrowRightOutlined,
  DeploymentUnitOutlined,
  PictureOutlined,
  VideoCameraOutlined
} from '@ant-design/icons-vue'
import {MenuProps} from 'ant-design-vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const current = ref<string[]>(['Home'])
const items = ref<MenuProps['items']>([
  {
    key: 'Home',
    icon: () => h(HomeOutlined),
    label: 'Home',
    title: 'Home',
  },
  {
    key: 'KnowledgeGraph',
    icon: () => h(DeploymentUnitOutlined),
    label: 'KnowledgeGraph',
    title: 'KnowledgeGraph',
  },
  {
    key: 'VectorAnimation',
    icon: () => h(ArrowRightOutlined),
    label: 'VectorAnimation',
    title: 'VectorAnimation',
  },
  {
    key: 'Pictures',
    icon: () => h(PictureOutlined),
    label: 'Pictures',
    title: 'Pictures',
  },
  {
    key: 'CameraView',
    icon: () => h(VideoCameraOutlined),
    label: 'CameraView',
    title: 'CameraView',
  },
])

function onSelected(e: any) {
  current.value = [e.key]
  router.push({name: e.key})
}
</script>

<template>
  <a-menu class="menu"
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @select="onSelected"/>
</template>

<style lang="less" scoped>
.menu {
  width: 100%;
  white-space: nowrap;
}
</style>