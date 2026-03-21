<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #f5f6f7;
  color: #222;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
}

::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}

::-webkit-scrollbar-track {
  background: transparent !important;
}

::-webkit-scrollbar-thumb {
  background: transparent !important;
}

html {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

body {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
</style>