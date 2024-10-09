<script setup lang="ts">
const colorMode=useColorMode();
const isDark=computed({
  get(){
    return colorMode.value=="dark";
  },set(){
    colorMode.preference=colorMode.value=="dark"?"light":"dark";
  }
});
const isMenuOpen=ref(false);
const menuNavigations=[
  {
    icon:"i-ri-home-7-fill",
    label:"トップ",
    to:"/"
  },
  {
    icon:"i-ri-sticky-note-add-fill",
    label:"新規項目",
    to:"/entries/new"
  },
  {
    icon:"i-ri-feedback-fill",
    label:"お問い合わせ",
    to:"/contact"
  }
];
useHead({
  titleTemplate:(title)=>
    title
    ?`${title} | caren`
    :"caren - 予定調整ツール"
});
</script>
<template>
  <header class="flex flex-end items-center h-min px-4 py-5 border border-transparent border-b-current backdrop-blur mb-4">
    <p class="text-xl mr-auto">caren - 予定調整ツール</p>
    <iconButton v-for="item in menuNavigations" class="hidden sm:block relative z-20" mode="small" v-bind="item"/>
    <iconButton class="hidden sm:block relative z-20" mode="small" :icon="isDark?'i-ri-moon-fill':!isDark?'i-ri-sun-fill':''" aria-label="Theme" :label="`${isDark?'ライト':'ダーク'}モードに切り替え`" @onclick="isDark=!isDark"/>
    <iconButton class="sm:hidden relative z-20" mode="small" icon="i-ri-menu-fill" label="メニュー" @onclick="isMenuOpen=true"/>
  </header>
  <USlideover v-model="isMenuOpen">
    <UCard class="flex flex-col flex-1" :ui="{body:{base:'flex-1'},ring:'',divide:'divide-y divide-gray-100 dark:divide-gray-800'}">
      <template #header>
        <div class="flex justify-end items-center">
          <p class="mr-auto">メニュー</p>
          <iconButton mode="small" :icon="isDark?'i-ri-moon-fill':'i-ri-sun-fill'" aria-label="Theme" :label="`${isDark?'ライト':'ダーク'}モードに切り替え`" @onclick="isDark=!isDark"/>
          <iconButton mode="small" icon="i-ri-close-fill" label="閉じる" @onclick="isMenuOpen=false"/>
        </div>
      </template>
      <div class="flex flex-col gap-2">
        <iconButton v-for="item in menuNavigations" mode="long" v-bind="item" @onclick="isMenuOpen=false"/>
      </div>
      <template #footer>
        <p class="text-right font-light text-sm">
          caren / &copy;{{`${new Date().getFullYear()==2024?"":"2024-"}${new Date().getFullYear()}`}} <ULink to="https://32ma.me">Shio Nakamura</ULink><br>
          Thanks for <ULink to="https://nuxt.com">Nuxt</ULink>, <ULink to="https://ui.nuxt.com">Nuxt UI</ULink>, <ULink to="https://github.com/Remix-Design/RemixIcon">Remix Icon</ULink> and <ULink to="https://cloudflare.com">Cloudflare</ULink>
        </p>
      </template>
    </UCard>
  </USlideover>
  <NuxtPage class="min-h-[calc(100vh-10.7rem)]" :transition="{name:'page',mode:'in-out',appear:true}"/>
  <footer class="flex justify-center items-center mt-3 p-3">
        <p class="text-center font-light text-sm">
          caren / &copy;{{`${new Date().getFullYear()==2024?"":"2024-"}${new Date().getFullYear()}`}} <ULink to="https://32ma.me">Shio Nakamura</ULink><br>
          Thanks for <ULink to="https://nuxt.com">Nuxt</ULink>, <ULink to="https://ui.nuxt.com">Nuxt UI</ULink>, <ULink to="https://github.com/Remix-Design/RemixIcon">Remix Icon</ULink> and <ULink to="https://cloudflare.com">Cloudflare</ULink>
        </p>
  </footer>
  <UNotifications />
</template>
<style>
.page-enter-active{
  transition:all .7s cubic-bezier(0,.5,0,1);
}
.page-enter-from{
  opacity:0;
  transform:translateY(10px);
  filter:blur(1px);
}
</style>