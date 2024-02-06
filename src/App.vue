<script lang="ts" setup>
import router from "@/router";
import { ref } from "vue";
function goto(pattern) {
  router.push(pattern);
}

const isCollapse = ref(false);
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
</script>
<template>
  <div class="factory-layout">
    <!-- 顶部标题 -->
    <el-header class="header">
      <h2>Bookmarks Connecter</h2>
    </el-header>
    <!-- 侧边栏 -->
    <el-aside class="sidebar">
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
      >
        <h1>Options</h1>
        <el-divider />
        <el-menu-item index="1" @click="goto('/general')">
          <el-icon><Operation /></el-icon>
          <template #title>General</template>
        </el-menu-item>
        <el-menu-item index="2" @click="goto('/bookmarks')">
          <el-icon><Collection /></el-icon>
          <template #title>Bookmarks</template>
        </el-menu-item>
        <el-menu-item index="3" @click="goto('/changelog')">
          <el-icon><document /></el-icon>
          <template #title>Changelog</template>
        </el-menu-item>
        <el-menu-item index="4" @click="goto('/about')">
          <el-icon><More /></el-icon>
          <template #title>About</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主要内容区域 -->
    <el-main class="content">
      <div class="container">
        <RouterView />
      </div>
    </el-main>
  </div>
</template>

<style scoped>
.el-menu-vertical-demo {
  height: 100%;
  background: none;
  padding: 30px 25px 0px 50px;
}
el-menu .el-menu-vertical-demo:not(.el-menu--collapse) {
  min-height: 400px;
}
.factory-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  flex-wrap: wrap;
}

.header {
  padding: 10px;
  height: 60px;
  width: 100%;
  border-bottom: solid 1px var(--el-menu-border-color);
}

.sidebar {
  width: 340px;
}
.content {
  flex: 1;
  width: 800px;
  height: 100%;
  padding: 0;
}
.container {
  padding-left: 80px;
  padding-top: 20px;
  width: 900px;
}
</style>
