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
    <el-header class="header">
      <h2>BookmarksBridge</h2>
      <el-space>
        <el-tag type="primary">On Sync</el-tag>
        <el-text class="mx-1 username">yong11021@outlook.com</el-text>
      </el-space>
    </el-header>
    <el-aside class="sidebar">
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-menu-item index="1" @click="goto('/general')">
          <el-icon><Operation /></el-icon>
          <template #title>General</template>
        </el-menu-item>
        <el-menu-item index="2" @click="goto('/bookmarks')">
          <el-icon><CollectionTag /></el-icon>
          <template #title>Bookmarks</template>
        </el-menu-item>
        <el-menu-item index="3" @click="goto('/changelog')">
          <el-icon><document /></el-icon>
          <template #title>Changelog</template>
        </el-menu-item>
        <el-menu-item index="4" @click="goto('/about')">
          <el-icon><Help /></el-icon>
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
  display: flex;
  justify-content: space-between;
  padding: 10px 40px;
}

.sidebar {
  width: 340px;
}
.content {
  flex: 1;
  width: 800px;
  height: 100%;
  padding: 0;
  background: url(./assets/logo.png);
  background-repeat: no-repeat;
  background-position: center;
  background-blend-mode: lighten;
}
.container {
  padding-left: 80px;
  padding-top: 20px;
  width: 900px;
}

.username {
}
</style>
