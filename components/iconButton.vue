<script setup lang="ts">
defineProps({
    mode:{validator(v:string){return ["small","long"].includes(v)}},
    icon:String,
    label:String
});
</script>
<template>
    <UPopover v-if="mode=='small'" mode="hover">
      <UButton :icon="icon" color="gray" variant="ghost" @click="$emit('onclick')" v-bind="$attrs"/>
      <template #panel>
        <div class="p-2">
          <p class="text-sm">{{label}}</p>
        </div>
      </template>
    </UPopover>
    <UButton v-else-if="mode=='long'" :icon="icon" color="gray" variant="ghost" @click="$emit('onclick')" v-bind="$attrs">{{label}}</UButton>
    <UPopover v-else mode="hover">
      <UButton icon="i-ri-error-warning-fill" disabled aria-disabled color="gray" variant="ghost" @click="$emit('onclick')" v-bind="$attrs"/>
      <template #panel>
        <div class="p-2">
          <p class="text-sm">Specify Mode!<br>"small" | "long"</p>
        </div>
      </template>
    </UPopover>
</template>