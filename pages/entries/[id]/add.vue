<script setup lang="ts">
import {boolean,object,string,array,date} from "yup";
import {format} from "date-fns";
import type {AsyncData} from "#app";
import type {Entry,EntryUserData,EntryUserSchedule} from "@/interface/entry";
const toast=useToast();
const timesArray=[
    "00:00","00:30",
    "01:00","01:30",
    "02:00","02:30",
    "03:00","03:30",
    "04:00","04:30",
    "05:00","05:30",
    "06:00","06:30",
    "07:00","07:30",
    "08:00","08:30",
    "09:00","09:30",
    "10:00","10:30",
    "11:00","11:30",
    "12:00","12:30",
    "13:00","13:30",
    "14:00","14:30",
    "15:00","15:30",
    "16:00","16:30",
    "17:00","17:30",
    "18:00","18:30",
    "19:00","19:30",
    "20:00","20:30",
    "21:00","21:30",
    "22:00","22:30",
    "23:00","23:30",
    "24:00"
];
const route=useRoute();
const res:AsyncData<Entry,Error|null>=useFetch(`/api/entries/${route.params.id}`);
let entryData:Ref<Entry>=ref(res.data.value?{
...res.data.value,
date:{
    start:new Date(res.data.value.date.start),
    end:new Date(res.data.value.date.end)
}
}:{title:"",author:"",key:"",date:{start:new Date(0),end:new Date()},data:[]});
useHead({
    title:entryData.value.title!=""
    ?`自分の予定を入力 | ${entryData.value.title}`
    :"自分の予定を入力"
});
const scheduleSchema=array(object({
    type:boolean(),
    repeat:boolean(),
    date:date(),
    time:array(string()).length(2),
    comment:string()
})),schema=object({
    name:string().required("必須項目です"),
    key:string().required("必須項目です"),
    comment:string(),
    empty:boolean(),
    schedule:scheduleSchema.required("必須項目です")
});
const state:EntryUserData=reactive({
    name:"",
    comment:"",
    key:"",
    empty:false,
    schedule:[]
});
const scheduleFormState:EntryUserSchedule=reactive({
    type:false,
    repeat:false,
    date:new Date(),
    time:["12:00","24:00"],
    comment:""
}),scheduleFormInitState={
    type:false,
    repeat:false,
    date:new Date(),
    time:["12:00","24:00"],
    comment:""
};
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
async function submitSchedule(){
    try{
        state.key=await hashPassword(state.key as string);
        const res=await $fetch(`/api/entries/${route.params.id}`,{
            method:"post",
            body:state
        });
        isConfirmOpen.value=false;
        toast.add({
            icon:"i-ri-checkbox-circle-line",
            title:"予定を登録しました！",
            description:"読み込まれると、自分の予定を確認できるはずです。"
        });
        localStorage.removeItem("scheduleFormState");
        navigateTo(`/entries/${route.params.id}`);
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
const isConfirmOpen=ref(false),isEditOpen=ref(false),editScheduleTarget=ref(0);
const isLoadingState=ref(true);
onMounted(()=>{
    const savedState=localStorage.getItem("scheduleFormState");
    if(savedState){
        const parsedState=JSON.parse(savedState);
        Object.assign(state,parseDate(parsedState));
    }
    setTimeout(()=>{isLoadingState.value=false},300);
});
watch(state,(newState)=>{
    isLoadingState.value=true;
    const stringifyedState=stringifyDate(newState);
    localStorage.setItem("scheduleFormState",JSON.stringify({
        ...stringifyedState,
        key:""
    }));
    setTimeout(()=>{isLoadingState.value=false},700);
},{deep:true});
const openEditModal=(i:number)=>{
    Object.assign(scheduleFormState,scheduleFormInitState);
    if(state.schedule[i]){
        Object.assign(scheduleFormState,state.schedule[i]);
    }
    isEditOpen.value=true;
    editScheduleTarget.value=i;
},applyEditingScheduleItem=(i:number)=>{
    if(state.schedule[i]){
        Object.assign(state.schedule[i],{...scheduleFormState})
    }else{
        state.schedule.push({...scheduleFormState});
    }
    isEditOpen.value=false;
},importJSON=async()=>{
    const readFile=():Promise<void|EntryUserSchedule[]>=>new Promise((resolve,reject)=>{
        const fileInput=document.createElement("input");
        fileInput.type="file";
        fileInput.accept=".json";
        fileInput.onchange=(event)=>{
            const target=event.target as HTMLInputElement;
            const file:File|undefined=target.files?.[0];
            if(!file){
                resolve();
            }
            const reader=new FileReader();
            reader.onload=(e)=>{
                try{
                    const result=e.target?.result;
                    if(typeof result!="string"){
                        throw new Error("ファイルの内容が文字列ではありません。")
                    }
                    resolve(JSON.parse(result));
                }catch(err){
                    reject(err);
                }
            }
            reader.onerror=(err)=>{
                reject((err.target as FileReader).error||new Error("不明なエラーが発生しました。"));
            }
            if(file){reader.readAsText(file)}
        }
        fileInput.click();
    });
    try{
        const jsonData=await readFile();
        if(jsonData){
            jsonData.forEach(sc=>{state.schedule.push(parseDate(sc))});
            toast.add({
                icon:"i-ri-checkbox-circle-line",
                title:"予定を追加しました！",
                description:"JSONファイルのデータが正常に読み込まれました。"
            });
        }
    }catch(err){
        if(err instanceof Error){
            toast.add({
                icon:"i-ri-error-warning-line",
                color:"red",
                title:"ファイルの読み込みに失敗しました！",
                description:err.message
            });
        }
    }
},exportJSON=()=>{
    const data=JSON.stringify(state.schedule);
    const elem=document.createElement("a");
    elem.download=`caren_export_${format(new Date(),"yyMMdd")}.json`;
    elem.href=URL.createObjectURL(new Blob([data],{type:"application/json"}));
    elem.dataset.downloadurl=["application/json",elem.download,elem.href].join(":");
    elem.click();
};
</script>
<template>
    <UContainer>
        <h1 class="text-4xl font-semibold mb-1">自分の予定を入力</h1>
        <NuxtLink to="./" class="block mb-2 underline">← {{entryData.title?`${entryData.title} に`:""}}戻る</NuxtLink>
        <Transition name="miniload">
            <div class="flex flex-row items-center gap-1" v-if="isLoadingState">
                <UIcon name="i-ri-loader-5-fill" class="animate-spin"/>
                <p class="text-sm">入力内容を同期中……</p>
            </div>
        </Transition>
        <UForm :schema="schema" :state="state" class="space-y-4">
            <UFormGroup label="名前" name="name">
                <UInput v-model="state.name"/>
            </UFormGroup>
            <UFormGroup label="備考" name="comment">
                <UTextarea v-model="state.comment" autoresize/>
            </UFormGroup>
            <UFormGroup label="空欄:" name="empty">
                <div class="flex flex-row items-center gap-1">
                    <UToggle v-model="state.empty" on-icon="i-ri-calendar-check-fill" off-icon="i-ri-calendar-close-fill"/>
                    {{state.empty?"空き":"参加不可"}}
                </div>
            </UFormGroup>
            <UFormGroup label="パスワード" name="key">
                <p class="text-sm text-gray-400">編集時に使われます</p>
                <UInput v-model="(state.key as string)" type="password"/>
            </UFormGroup>
            <UFormGroup label="予定" name="schedule">
                <UCard v-if="Array.isArray(state.schedule)" v-for="sc,i in state.schedule" :key="i" class="my-2">
                    <div class="flex flex-row items-center gap-2 mb-3" :class="sc.type?'text-lime-500':'text-gray-500'">
                        <UIcon :name="sc.type?'i-ri-calendar-check-fill':'i-ri-calendar-close-fill'"/>
                        <p>{{sc.type?'空き':'参加不可'}}</p>
                    </div>
                    <p class="text-lg">
                        {{
                            sc.repeat
                            ?`毎週${["日","月","火","水","木","金","土"][sc.date.getDay()]}曜日`
                            :format(sc.date,"yyy/M/d")
                        }}
                        {{sc.time[0]}} - {{sc.time[1]}} 
                    </p>
                    <p v-show="sc.comment" class="text-gray-500">"{{sc.comment}}"</p>
                    <template #footer>
                        <div class="flex items-center">
                            <UButton class="mr-auto" color="white" icon="i-ri-edit-2-fill" @click="openEditModal(i)">編集</UButton>
                            <iconButton class="text-red-400" color="red" mode="small" icon="i-ri-delete-bin-line" label="削除" @onclick="state.schedule.splice(i,1)"/>
                        </div>
                    </template>
                </UCard>
                <div class="flex gap-2 ml-1">
                    <UPopover :popper="{placement:'bottom-start'}">
                        <UButton color="gray" icon="i-ri-menu-add-fill">追加…</UButton>
                        <template #panel>
                            <UButtonGroup size="md" orientation="vertical">
                                <UButton color="white" icon="i-ri-sticky-note-add-fill" @click="openEditModal(state.schedule.length)">新規項目</UButton>
                                <UButton color="white" icon="i-ri-file-edit-line" @click="importJSON()">ファイルから入力</UButton>
                            </UButtonGroup>
                        </template>
                    </UPopover>
                    <UButton v-if="Array.isArray(state.schedule)&&state.schedule.length!=0" color="gray" icon="i-ri-download-2-line" @click="exportJSON()">予定をダウンロード</UButton>
                </div>
            </UFormGroup>
            <UButton block @click="validate" icon="i-ri-checkbox-circle-line" size="md" class="text-base" type="submit">確認</UButton>
            <br>
        </UForm>
        <UModal v-model="isEditOpen">
            <UCard>
                <template #header>
                    <div class="flex justify-end items-center">
                        <h2 class="mr-auto text-2xl font-semibold">予定を{{state.schedule[editScheduleTarget]?"編集":"作成"}}</h2>
                        <iconButton mode="small" icon="i-ri-close-fill" label="閉じる" @onclick="isEditOpen=false"/>
                    </div>
                </template>
                <Transition name="miniload">
                    <div class="flex flex-row items-center gap-1" v-if="isLoadingState">
                        <UIcon name="i-ri-loader-5-fill" class="animate-spin"/>
                        <p class="text-sm">入力内容を同期中……</p>
                    </div>
                </Transition>
                <UForm :schema="scheduleSchema" :state="scheduleFormState" class="space-y-4">
                    <UFormGroup label="種類" name="type">
                        <div class="flex flex-row items-center gap-1">
                            <UToggle v-model="scheduleFormState.type" on-icon="i-ri-calendar-check-fill" off-icon="i-ri-calendar-close-fill"/>
                            {{scheduleFormState.type?"空き":"参加不可"}}
                        </div>
                    </UFormGroup>
                    <UFormGroup label="毎週繰り返す" name="repeat">
                        <div class="flex flex-row items-center gap-1">
                            <UToggle v-model="scheduleFormState.repeat" on-icon="i-ri-repeat-2-fill" off-icon="i-ri-repeat-fill"/>
                            {{scheduleFormState.repeat?"はい":"いいえ"}}
                        </div>
                    </UFormGroup>
                    <UFormGroup label="日付" name="date">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-ri-calendar-event-fill" :label="format(scheduleFormState.date, 'd MMM, yyy')" />
                            <template #panel="{ close }">
                            <ClientOnly><DatePicker v-model="scheduleFormState.date" is-required @close="close" /></ClientOnly>
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UFormGroup label="時刻" name="time">
                        <div class="flex items-center gap-auto w-full">
                            <UInputMenu class="w-5/12" v-model="scheduleFormState.time[0]" :options="timesArray.filter((elem,i)=>i<47)"/>
                            <p class="mx-auto">-</p>
                            <UInputMenu class="w-5/12" v-model="scheduleFormState.time[1]" :options="timesArray.slice(1)"/>
                        </div>
                    </UFormGroup>
                    <UFormGroup label="備考" name="comment">
                        <UTextarea v-model="scheduleFormState.comment"/>
                    </UFormGroup>
                </UForm>
                <UButton class="mt-4" icon="i-ri-checkbox-circle-fill" @click="applyEditingScheduleItem(editScheduleTarget)">{{state.schedule[editScheduleTarget]?"適用":"追加"}}</UButton>
            </UCard>
        </UModal>
        <UModal v-model="isConfirmOpen">
            <UCard>
                <template #header>
                    <h2 class="text-2xl font-semibold">確認</h2>
                </template>
                <p class="mb-2">以下の内容でよろしいですか？</p>
                <h3 class="text-lg font-medium">名前</h3>
                <p class="min-h-4">{{state.name}}</p>
                <h3 class="text-lg font-medium">備考</h3>
                <p class="min-h-4">{{state.comment}}</p>
                <h3 class="text-lg font-medium">空欄:</h3>
                <p class="flex items-center gap-1 min-h-4" :class="state.empty?'text-lime-500':'text-gray-500'">
                    <UIcon :name="state.empty?'i-ri-calendar-check-fill':'i-ri-calendar-close-fill'"/>
                    {{state.empty?"空き":"参加不可"}}
                </p>
                <h3 class="text-lg font-medium">予定</h3>
                <ul class="pl-6">
                    <li v-for="sc in state.schedule">
                        <span class="flex items-center gap-1" :class="sc.type?'text-lime-500':'text-gray-500'">
                            <UIcon :name="sc.type?'i-ri-calendar-check-fill':'i-ri-calendar-close-fill'"/>
                            {{sc.type?'空き':'参加不可'}}
                        </span>
                        {{
                            sc.repeat
                            ?`毎週${["日","月","火","水","木","金","土"][sc.date.getDay()]}曜日`
                            :format(sc.date,"yyy/M/d")
                        }}
                        {{sc.time[0]}} - {{sc.time[1]}}<br>
                        備考: "{{sc.comment}}"
                    </li>
                </ul>
                <template #footer>
                    <div class="flex flex-row gap-2">
                        <UButton @click="submitSchedule" icon="i-ri-checkbox-circle-fill" size="md" class="text-base">登録</UButton>
                        <UButton @click="isConfirmOpen=false" icon="i-ri-arrow-go-back-line" color="white" variant="solid" size="md" class="text-base">やめておく</UButton>
                    </div>
                </template>
            </UCard>
        </UModal>
    </UContainer>
</template>
<style scoped>
.miniload-leave-to{
    opacity:0;
}
.miniload-leave-active{
    transition:.3s all;
}
</style>