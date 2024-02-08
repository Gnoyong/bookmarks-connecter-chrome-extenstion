<template>
  <h1>Bookmarks</h1>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Online</span>
        <el-button class="button" type="primary" text bg @click="deleteRepeat"
          >Remove duplicate</el-button
        >
      </div>
    </template>
    <el-tree
      :data="data"
      :props="defaultProps"
      @node-click="handleNodeClick"
      default-expand-all="true"
    />
  </el-card>
</template>
<script lang="ts" setup>
import api from "@/utils/api.js";
import { ref, onMounted } from "vue";
import { ElNotification } from "element-plus";

interface Tree {
  id: number;
  label: string;
  children?: Tree[];
}

const data = ref<Tree[]>([]);
onMounted(() => {
  api.queryView().then((response) => {
    const rows = response.data.result;
    const itemMap = {};

    // 将每个项按照其 id 存储在一个对象中，方便后续通过 id 查找
    rows.forEach((item) => {
      itemMap[item.chrome_id] = { id: item.chrome_id, label: item.name, children: [] };
    });

    // 将每个项连接到其父节点的 children 数组中
    rows.forEach((item) => {
      if (item.parent_id !== "0" && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.chrome_id]);
      } else {
        data.value.push(itemMap[item.chrome_id]);
      }
    });
    console.log(data.value);
  });
});

const handleNodeClick = (data: Tree) => {
  console.log(data);
};

const defaultProps = {
  id: "id",
  children: "children",
  label: "label",
};

async function deleteRepeat() {
  const response = await chrome.runtime.sendMessage({
    command: "removeDuplicateBookmarks",
  });
  ElNotification({
    type: "success",
    position: "bottom-right",
    message: "The duplicate bookmarks have been successfully removed.",
  });
}
</script>
<style lang="css">
h1 {
  margin-bottom: 12px;
}
</style>
