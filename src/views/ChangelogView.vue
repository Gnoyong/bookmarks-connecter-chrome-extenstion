<template>
  <h1>Changelog</h1>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Unsynchronized Changes</span>
      </div>
    </template>
    <el-table :data="changelog" style="width: 100%">
      <el-table-column prop="id" label="Bookmarks Id" width="180" />
      <el-table-column prop="type" label="Type" width="180" />
      <el-table-column prop="info" label="Info">
        <template #default="scope">
          <span>{{ JSON.stringify(scope.row.info) }}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Change History</span>
      </div>
    </template>
    <el-table :data="history" style="width: 100%">
      <el-table-column prop="id" label="Bookmarks Id" width="180" />
      <el-table-column prop="type" label="Type" width="180" />
      <el-table-column prop="info" label="Info">
        <template #default="scope">
          <span>{{ JSON.stringify(scope.row.info) }}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

const changelog = ref([]);
const history = ref([]);

onMounted(() => {
  loop();
});

function loop() {
  chrome.storage.sync.get().then((items) => {
    changelog.value = [...items.changelog];
    history.value = [...items.history];
  });
  setTimeout(loop, 3000);
}
</script>

<style scoped>
h1 {
  margin-bottom: 12px;
}

.box-card {
  margin-bottom: 30px;
}
</style>
