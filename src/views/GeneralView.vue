<script setup></script>
<template>
  <div class="c01140">
    <div class="c015432">
      <h1>General</h1>
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>Card Name</span>
            <el-button class="button" type="primary" text bg>Save</el-button>
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
            <td label="Name">Host</td>
            <td label="Description">Host IP</td>
            <td label="Default" :span="2">127.0.0.1</td>
            <td label="Control">
              <el-input v-model="input" placeholder="Please input" />
            </td>
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
  width: 20%;
  font-weight: bold;
}

td:nth-child(2),
td:nth-child(3) {
  width: 25%;
}

td:nth-child(4) {
  width: 30%;
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
