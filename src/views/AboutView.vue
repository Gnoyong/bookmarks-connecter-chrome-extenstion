<template>
  <h1>About</h1>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Contact Information</span>
      </div>
    </template>

    <p>
      Email:
      <el-link type="primary" href="mailto:yong11021@outlook.com"
        >yong11021@outlook.com</el-link
      >
    </p>
  </el-card>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
