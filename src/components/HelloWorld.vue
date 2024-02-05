<template>
    <fluent-card>
      <h2>{{msg}}</h2>
      <fluent-button appearance="accent" v-on:click="onClick">Click Me</fluent-button>
    </fluent-card>
</template>
<script>
  export default {
    name: 'HelloWorld',
    props: {
      msg: String,
    },
    methods: {
      onClick: function () {
        console.log('clicked!');
      },
    },
  };
</script>
<style scoped>
  fluent-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  h2 {
    font-size: var(--type-ramp-plus-5-font-size);
    line-height: var(--type-ramp-plus-5-line-height);
  }

  fluent-card > fluent-button {
    align-self: flex-end;
  }
</style>

