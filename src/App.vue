<template>
  <div class="app-container">
    <OrderUploader />
  </div>
</template>

<script setup lang="ts">
// 引入你刚才创建的组件
import OrderUploader from './views/DataUploader.vue'
</script>

<style>
/* 全局基础样式，确保页面铺满 */
body,
html {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
.app-container {
  padding: 20px;
}
</style>
