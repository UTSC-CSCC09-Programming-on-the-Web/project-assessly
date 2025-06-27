<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div id="app">
    <header>
      <h1>Welcome to Assessly</h1>
      <p>Your assessment platform built with Vue.js</p>
    </header>

    <main>
      <HelloWorld msg="Assessly" />
    </main>

    <footer>
      <p>&copy; 2024 Assessly. Built with Vue.js & TypeScript.</p>
    </footer>
  </div>
</template>

<style scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

header {
  margin-bottom: 3rem;
}

header h1 {
  font-size: 3.2em;
  line-height: 1.1;
  color: #42b883;
  margin-bottom: 0.5rem;
}

header p {
  font-size: 1.2em;
  color: #666;
  margin: 0;
}

main {
  margin: 3rem 0;
}

footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 0.9em;
}
</style> 