<script setup lang="ts">
import {boolean,number,object,string,array,date} from "yup";
import {format} from "date-fns";
import type {Entry} from "@/interface/entry";
const seoMeta={
    title:"新規項目",
    description:"独自の新しいUIを備え、様々なケースで簡単に使える、ユーザーフレンドリーな日程調整ツールです。",
};
useSeoMeta({
    title:seoMeta.title,
    description:seoMeta.description,
    ogTitle:seoMeta.title,
    ogDescription:seoMeta.description
});
const toast=useToast();
const schema=object({
    title:string().required("必須項目です"),
    key:string().required("必須項目です"),
    description:string(),
    author:string().required("必須項目です"),
    date:object({start:date(),end:date()}).required("必須項目です"),
    data:array()
});
const state:Entry=reactive({
    title:"",
    key:"",
    description:"",
    author:"",
    date:{start:new Date(),end:new Date()},
    excludes:[],
    data:[]
});
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
async function createEntry(){
    try{
        state.key=await hashPassword(state.key as string);
        const res=await $fetch(`/api/entries`,{
            method:"post",
            body:state
        });
        isConfirmOpen.value=false;
        useCopyToClipboard().copy(`https://caren.32ma.me/entries/${res}`);
        toast.add({
            icon:"i-ri-checkbox-circle-line",
            title:"項目を作成しました！",
            description:"クリップボードにリンクをコピーしました。ミーティング相手に共有して、予定を聞いてみましょう！"
        });
        localStorage.removeItem("newEntryFormState");
        navigateTo(`/entries/${res}`);
    }catch(err){
        isConfirmOpen.value=false;
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
const isConfirmOpen=ref(false);
const isLoadingState=ref(true);
onMounted(()=>{
    const savedState=localStorage.getItem("newEntryFormState");
    if(savedState){
        const parsedState=JSON.parse(savedState);
        Object.assign(state,{
            ...parsedState,
            date:{
                start:new Date(parsedState.date.start),
                end:new Date(parsedState.date.end)
            }
        })
    }
    setTimeout(()=>{isLoadingState.value=false},300);
});
watch(state,(newState)=>{
    isLoadingState.value=true;
    localStorage.setItem("newEntryFormState",JSON.stringify({
        ...newState,
        date:{
            start:newState.date.start.toISOString(),
            end:newState.date.end.toISOString()
        },
        key:""
    }));
    setTimeout(()=>{isLoadingState.value=false},700);
},{deep:true});
</script>
<template>
    <UContainer>
        <h1 class="text-4xl font-semibold mb-4">新規項目</h1>
        <Transition>
            <div class="flex flex-row items-center gap-1" v-if="isLoadingState">
                <UIcon name="i-ri-loader-5-fill" class="animate-spin"/>
                <p class="text-sm">入力内容を同期中……</p>
            </div>
        </Transition>
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
            <UFormGroup label="パスワード" name="key">
                <p class="text-sm text-gray-400">編集時に使われます</p>
                <UInput v-model="(state.key as string)" type="password"/>
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
                    <p class="text-sm mb-3">「作成」をクリックすると、クリップボードに閲覧ページのリンクがコピーされます。</p>
                    <div class="flex flex-row gap-2">
                        <UButton @click="createEntry" icon="i-ri-checkbox-circle-fill" size="md" class="text-base">作成</UButton>
                        <UButton @click="isConfirmOpen=false" icon="i-ri-arrow-go-back-line" color="white" variant="solid" size="md" class="text-base">やめておく</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>
    </UContainer>
</template>
<style scoped>
.v-leave-to{
    opacity:0;
}
.v-leave-active{
    transition:.3s all;
}
</style>