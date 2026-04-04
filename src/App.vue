<template>
  <router-view />
</template>

<script setup>
</script>

<style>
:root {
  /* Morandi Color Palette */
  --color-cream: #faf9f7;
  --color-ivory: #f5f3f0;
  --color-oatmeal: #e8e5e0;
  --color-warm-gray: #d4cfc8;
  --color-prussian-blue: #384759;
  --color-sage-green: #8b9a7f;
  --color-champagne-gold: #d4af8f;
  --color-burgundy: #7a4a5a;

  /* Text Colors */
  --color-text-primary: #3d3a37;
  --color-text-secondary: #7a7a77;
  --color-text-light: #9a9a97;
  --color-text-light-gray: #c0c0bd;

  /* UI Colors */
  --color-border: #e8e5e0;
  --color-error: #c85a54;
  --color-success: #8b9a7f;
  --color-warning: #d4af8f;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(61, 58, 55, 0.08);
  --shadow-md: 0 2px 6px rgba(61, 58, 55, 0.06);
  --shadow-lg: 0 4px 12px rgba(61, 58, 55, 0.08);
  --shadow-xl: 0 8px 32px rgba(61, 58, 55, 0.12);

  --morandi-cream: #faf9f7;
  --morandi-ivory: #f5f3f0;
  --morandi-oatmeal: #e8e5e0;
  --morandi-prussian-blue: #384759;
  --morandi-sage-green: #8b9a7f;
  --morandi-champagne: #d4af8f;
  --morandi-burgundy: #7a4a5a;
  --morandi-dusty-rose: #c49f9a;
  --morandi-muted-blue: #6b8896;
}

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