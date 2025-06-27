<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  msg: string
}>()

const count = ref(0)
</script>

<template>
  <div class="hello-world">
    <h2>{{ msg }}</h2>
    
    <div class="card">
      <button type="button" @click="count++">Count is {{ count }}</button>
      <p>
        Edit
        <code>src/components/HelloWorld.vue</code> to test HMR
      </p>
    </div>

    <div class="features">
      <h3>Ready to build amazing assessments!</h3>
      <ul>
        <li>✅ Vue 3 with Composition API</li>
        <li>✅ TypeScript support</li>
        <li>✅ Vite for fast development</li>
        <li>✅ Modern development setup</li>
      </ul>
    </div>

    <p class="read-the-docs">
      Click on the Vue logo to learn more
    </p>
  </div>
</template>

<style scoped>
.hello-world {
  padding: 2rem;
}

h2 {
  color: #42b883;
  margin-bottom: 1.5rem;
}

.card {
  padding: 2em;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 2rem 0;
}

.card button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #42b883;
  color: white;
  cursor: pointer;
  transition: all 0.25s;
}

.card button:hover {
  background-color: #369870;
}

.card button:focus,
.card button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.features {
  margin: 2rem 0;
}

.features h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.features ul {
  list-style: none;
  padding: 0;
  max-width: 400px;
  margin: 0 auto;
}

.features li {
  padding: 0.5rem 0;
  text-align: left;
}

.read-the-docs {
  color: #888;
  margin-top: 2rem;
}

code {
  background-color: #f1f1f1;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style> 