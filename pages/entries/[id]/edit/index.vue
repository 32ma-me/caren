<script setup lang="ts">
import {object,string,array,date} from "yup";
import {format} from "date-fns";
import type {AsyncData} from "#app";
import type {Entry} from "@/interface/entry";
const route=useRoute();
const isLoading=ref(true),loadingMsg=ref("");
const res:AsyncData<Entry,Error|null>=useFetch(`/api/entries/${route.params.id}`);
const toast=useToast();
const schema=object({
    title:string().required("必須項目です"),
    key:object(),
    description:string(),
    author:string().required("必須項目です"),
    date:object({start:date(),end:date()}).required("必須項目です"),
    data:array()
});
const state:Entry=reactive({
    title:"",
    key:{
        salt:"",
        hash:""
    },
    description:"",
    author:"",
    date:{start:new Date(),end:new Date()},
    excludes:[],
    data:[]
});
let isWatchedOnce=false;
useHead({
    title:state.title!=""
    ?`項目を編集 | ${state.title}`
    :"項目を編集"
});
watch(()=>res.data.value,(respData)=>{
    if(respData){
        Object.assign(state,{
            ...respData,
            date:{
                start:new Date(respData.date.start),
                end:new Date(respData.date.end)
            }
        });
        setTimeout(()=>{isLoading.value=false;},300);
    }else{
        isLoading.value=true;
        if(isWatchedOnce){
            loadingMsg.value="読み込みに失敗しました。URLをもう一度お確かめください。";
        }else{
            isWatchedOnce=true;
        }
    }
},{deep:true,immediate:true});
async function validate(){
        try{
            await schema.validate(state,{abortEarly:true});
            isConfirmOpen.value=true;
        }catch(e){
            toast.add({
                icon:"i-ri-error-warning-line",
                color:"red",
                title:"入力内容が正しくありません！",
                description:"内容を確認し、正しく入力し直してください。"
            });
        }
}
const isRequestPending=ref(false);
async function editEntry(){
    try{
        isRequestPending.value=true;
        const res=await $fetch(`/api/entries/${route.params.id}`,{
            method:"put",
            body:state
        });
        isConfirmOpen.value=false;
        toast.add({
            icon:"i-ri-checkbox-circle-line",
            title:"項目を編集しました！",
            description:"正常に編集が適用されました。"
        });
        navigateTo(`/entries/${route.params.id}`);
    }catch(err){
        isRequestPending.value=false;
        if(isError(err)){
            toast.add({
                icon:"i-ri-error-warning-line",
                color:"red",
                title:"エラーが発生しました！",
                description:err.message
            });
        }
    }
}
const isConfirmOpen=ref(false),isDeleteConfirmOpen=ref(false);
const password=ref(""),isAuthed=ref(false),isVerifying=ref(false),
verifyAuthor=async(pw:string)=>{
    isVerifying.value=true;
    isAuthed.value=await verifyPassword(pw,state.key as HashedPassword);
    if(isAuthed.value){password.value=""}
    setTimeout(()=>{isVerifying.value=false},300);
};
async function deleteEntry(){
    isVerifying.value=true;
    if(await verifyPassword(password.value,state.key as HashedPassword)){
        try{
            const resp=await useFetch(`/api/entries/${route.params.id}`,{
                method:"delete",
                body:state
            });
            isDeleteConfirmOpen.value=false;
            toast.add({
                icon:"i-ri-checkbox-circle-line",
                title:`「${res.data.value.title}」を削除しました！`,
                description:"項目は正常に削除されました。"
            });
            navigateTo(`/`);
        }catch(err){
            isDeleteConfirmOpen.value=false;
            if(isError(err)){
                toast.add({
                    icon:"i-ri-error-warning-line",
                    color:"red",
                    title:"エラーが発生しました！",
                    description:err.message
                });
            }
        }
    }
    setTimeout(()=>{isVerifying.value=false},300);
}
</script>
<template>
    <UContainer>
        <Transition name="every">
            <div class="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center gap-3 z-10 pointer-events-none" v-if="isLoading">
                <UIcon name="i-ri-loader-5-fill" class="block animate-spin w-12 h-12"/>
                <p class="text-sm text-center">{{loadingMsg}}</p>
            </div>
            <div class="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center z-10 pointer-events-none" v-else-if="!isAuthed">
                <div>
                    <h2 class="text-2xl font-semibold my-2">🔒パスワードが必要です</h2>
                    <UInput class="pointer-events-auto" type="password" v-model="password"/>
                    <UButton type="submit" @click="verifyAuthor(password)" :loading="isVerifying" class="mt-3 pointer-events-auto" icon="i-ri-checkbox-circle-fill">{{isVerifying?"認証中…":"認証"}}</UButton>
                    <UButton :to="`./`" color="gray" class="ml-2 pointer-events-auto" icon="i-ri-arrow-go-back-line">戻る</UButton>
                </div>
            </div>
            <div v-else>
                <h1 class="text-4xl font-semibold mb-4">項目を編集</h1>
                <NuxtLink to="./" class="block mb-2 underline">← {{res.data.value.title?`${res.data.value.title} に`:""}}戻る</NuxtLink>
                <UForm :schema="schema" :state="state" class="space-y-4">
                    <UFormGroup label="項目名" name="title">
                        <UInput v-model="state.title" placeholder="○○MTG"/>
                    </UFormGroup>
                    <UFormGroup label="説明" name="description">
                        <UTextarea autoresize v-model="state.description" />
                    </UFormGroup>
                    <UFormGroup label="主催者" name="author">
                        <UInput v-model="state.author"/>
                    </UFormGroup>
                    <UFormGroup label="期間" name="date">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-ri-calendar-event-fill" color="gray">
                            {{ format(state.date.start, 'yyy/M/d') }} - {{ format(state.date.end, 'yyy/M/d') }}
                            </UButton>
                            <template #panel="{ close }">
                                <ClientOnly><DatePicker v-model="state.date" @close="close" /></ClientOnly>
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UButton block @click="validate" icon="i-ri-checkbox-circle-line" size="md" class="text-base" type="submit">確認</UButton>
                    <UButton block color="red" variant="soft" @click="isDeleteConfirmOpen=true" icon="i-ri-delete-bin-line" size="md" class="text-base" type="submit">項目を削除</UButton>
                    <br>
                </UForm>
                <UModal v-model="isConfirmOpen">
                    <UCard>
                        <template #header>
                            <h2 class="text-2xl font-semibold">確認</h2>
                        </template>
                        <p class="mb-2">以下の内容でよろしいですか？</p>
                        <h3 class="text-lg font-medium">項目名</h3>
                        <p class="min-h-4">{{state.title}}</p>
                        <h3 class="text-lg font-medium">説明</h3>
                        <p class="min-h-4">{{state.description}}</p>
                        <h3 class="text-lg font-medium">主催者</h3>
                        <p class="min-h-4">{{state.author}}</p>
                        <h3 class="text-lg font-medium">期間</h3>
                        <p class="min-h-4">{{format(state.date.start,'yyy/M/d')}} - {{format(state.date.end,'yyy/M/d')}}</p>
                        <template #footer>
                            <div class="flex flex-row gap-2">
                                <UButton @click="editEntry" icon="i-ri-checkbox-circle-fill" size="md" class="text-base" :loading="isRequestPending">適用</UButton>
                                <UButton @click="isConfirmOpen=false" icon="i-ri-arrow-go-back-line" color="white" variant="solid" size="md" class="text-base">やめておく</UButton>
                            </div>
                        </template>
                    </UCard>
                </UModal>
                <UModal v-model="isDeleteConfirmOpen">
                    <UCard>
                        <template #header>
                            <h2 class="text-2xl font-semibold">確認</h2>
                        </template>
                        <p class="text-lg">本当に項目「{{res.data.value.title}}」を<strong>削除しますか？</strong></p>
                        <p class="mt-2 mb-2">確認のため、以下にパスワードを入力してください。</p>
                        <UInput type="password" v-model="password"/>
                        <template #footer>
                            <div class="flex flex-row gap-2">
                                <UButton @click="deleteEntry" :loading="isVerifying" icon="i-ri-delete-bin-fill" color="red" size="md" class="text-base">{{isVerifying?"認証中…":"削除"}}</UButton>
                                <UButton @click="isDeleteConfirmOpen=false" icon="i-ri-arrow-go-back-line" color="white" variant="solid" size="md" class="text-base">やめておく</UButton>
                            </div>
                        </template>
                    </UCard>
                </UModal>
            </div>
        </Transition>
    </UContainer>
</template>
<style scoped>
.every-enter-active{
  transition:all .7s cubic-bezier(0,.5,0,1);
}
.every-enter-from{
  opacity:0;
  transform:translateY(10px);
  filter:blur(1px);
}
</style>