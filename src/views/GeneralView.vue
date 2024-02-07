<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElNotification } from "element-plus";
import { el, tr } from "element-plus/es/locale";
import api from "@/utils/api";

let storageCache = {};

const config = ref({
  host: "http://127.0.0.1:3000",
  sync: {
    enable: false,
    retryInterval: 3000,
  },
});

onMounted(() => {
  chrome.storage.local.get("config").then((items) => {
    Object.assign(storageCache, items);
    console.log("items", items);
    if (storageCache && storageCache.config) {
      config.value = Object.assign({}, config.value, storageCache.config);
    } else {
      console.log("no cache");
    }
  });
});

function save() {
  chrome.storage.local.set({ config: config.value }).then(() => {
    ElNotification({
      title: "Success",
      message: "Config saved",
      type: "success",
      position: "bottom-right",
    });
  });
}

function depthFirstTraversal(parent, node, callback) {
  callback(parent, node);
  node.children &&
    node.children.forEach((child) => {
      depthFirstTraversal(node, child, callback);
    });
}

function initialize() {
  chrome.bookmarks.getTree(async (tree: any[]) => {
    const dateModifiedList = [];
    const jsonString = JSON.stringify(tree, null, 1);
    const formData: FormData = new FormData();
    formData.append("file", new Blob([jsonString]));
    const response = await api.upload(formData);

    if (response.data.code !== 2000) {
      return;
    }

    api.initialize().then((response) => {
      if (response.data.code === 2000) {
        ElNotification({
          title: "Success",
          message: "Initialize completed",
          type: "success",
          position: "bottom-right",
        });
      }
    });

    depthFirstTraversal(null, tree[0], (parent, node) => {
      dateModifiedList.push([
        String(node.id),
        { dateModified: node.dateAdded, deleted: 0 },
      ]);
    });
    chrome.storage.local.set({ dateModifiedList: [...dateModifiedList] });
  });
}

async function synchronize() {
  const response = await chrome.runtime.sendMessage({ command: "doubleSync" });
  console.log(response);
}
</script>
<template>
  <div class="c01140">
    <div class="c015432">
      <h1>General</h1>
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>Card Name</span>
            <el-button class="button" type="primary" text bg @click="save"
              >Save</el-button
            >
          </div>
        </template>
        <table>
          <thead>
            <th>Name</th>
            <th>Description</th>
            <th>Default</th>
            <th>Control</th>
          </thead>
          <tbody>
            <tr>
              <td label="Name">Synchronize</td>
              <td label="Description">-</td>
              <td label="Default" :span="2">-</td>
              <td label="Control">
                <el-button type="primary" @click="synchronize">Synchronize</el-button>
              </td>
            </tr>
            <tr>
              <td label="Name">Initialize</td>
              <td label="Description">Initialize data</td>
              <td label="Default" :span="2">-</td>
              <td label="Control">
                <el-button type="primary" @click="initialize">Initialize</el-button>
              </td>
            </tr>
            <tr>
              <td label="Name">Sync</td>
              <td label="Description">Enable synchronization</td>
              <td label="Default" :span="2">Disable</td>
              <td label="Control">
                <el-switch v-model="config.sync.enable" />
              </td>
            </tr>
            <tr>
              <td label="Name">Host</td>
              <td label="Description">Host IP</td>
              <td label="Default" :span="2">http://127.0.0.1:3000</td>
              <td label="Control">
                <el-input v-model="config.host" placeholder="Please input" />
              </td>
            </tr>
            <tr>
              <td label="Name">Retry interval(ms)</td>
              <td label="Description">-</td>
              <td label="Default" :span="2">3000</td>
              <td label="Control">
                <el-input v-model.number="config.sync.retryInterval" />
              </td>
            </tr>
          </tbody>
        </table>
      </el-card>
    </div>
  </div>
</template>
<style lang="css">
table {
  width: 100%;
}

table {
  border-collapse: collapse;
}

td,
th {
  text-align: left;
  border-bottom: 1px solid rgb(230, 230, 230);
  padding: 0.5em 1em;
}

td:first-child {
  width: 25%;
  font-weight: bold;
}

td:nth-child(2),
td:nth-child(3) {
  width: 25%;
}

td:nth-child(4) {
  width: 25%;
}

h1 {
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
