<script setup lang="ts">
import {format,differenceInDays,addDays,isSameDay} from "date-fns";
import type {AsyncData} from "#app";
import type {Entry,EntryUserSchedule} from "@/interface/entry";
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
const isLoading=ref(true),loadingMsg=ref("");
const res:AsyncData<Entry,Error|null>=useFetch(`/api/entries/${route.params.id}`);
let isWatchedOnce=false;
let entryData:Ref<Entry>=ref(res.data.value?{
    ...res.data.value,
    date:{
        start:new Date(res.data.value.date.start),
        end:new Date(res.data.value.date.end)
    }
}:{title:"",key:{salt:"",hash:""},author:"",date:{start:new Date(0),end:new Date()},data:[]});
useHead({
    title:entryData.value.title!=""
    ?entryData.value.title
    :"読み込み中…"
});
const matchList:Ref<string[]>=ref([]);
const matchSchedule=()=>{
    matchList.value=[];
    const everyList:boolean[][][]=Array(entryData.value.data.length).fill(null).map(()=>[]);
    entryData.value.data.forEach((data,i)=>{
        const repeatSchedule:EntryUserSchedule[]=[];
        const singleSchedule:EntryUserSchedule[]=[];
        data.schedule.forEach(sc=>{sc.repeat?repeatSchedule.push(sc):singleSchedule.push(sc)});
        for(let l=0;l<differenceInDays(entryData.value.date.end,entryData.value.date.start)+1;l++){
            const targetDay=addDays(entryData.value.date.start,l);
            let list:boolean[]=Array(48).fill(data.empty);
            repeatSchedule.forEach(sc=>{
                if(sc.date.getDay()==targetDay.getDay()){
                    for(let j=timesArray.indexOf(sc.time[0]);j<timesArray.indexOf(sc.time[1]);j++){
                        list[j]=sc.type;
                    }
                }
            });
            singleSchedule.forEach(sc=>{
                if(isSameDay(sc.date,targetDay)){
                    for(let j=timesArray.indexOf(sc.time[0]);j<timesArray.indexOf(sc.time[1]);j++){
                        list[j]=sc.type;
                    }
                }
            });
            everyList[i].push(list);
        }
    });
    const mergedList:boolean[][]=everyList.reduce((mergedData:boolean[][],data)=>mergedData.map((row,i)=>row.map((val,j)=>val&&data[i][j])),
        Array(differenceInDays(entryData.value.date.end,entryData.value.date.start)+1).fill(Array(48).fill(true)));
    mergedList.forEach((list,i)=>{
        const targetDay=addDays(entryData.value.date.start,i);
            let cnt=0,prev=false;
            list.push(false);
            list.forEach((flag,l)=>{
                if(flag!=prev&&l!=0){
                    if(!flag){matchList.value.push(`${format(targetDay,"yyy/M/d")} ${timesArray[l-cnt]} - ${timesArray[l]}`)};
                    cnt=0;
                }
                cnt++;
                prev=flag;
            });
    })
};
watch(()=>res.data.value,(respData)=>{
    if(respData){
        entryData.value={
            ...respData,
            date:{
                start:new Date(respData.date.start),
                end:new Date(respData.date.end)
            }
        };
        entryData.value.data=entryData.value.data.map((data)=>parseDate(data));
        if(entryData.value.data.length>0){matchSchedule()}
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
</script>
<template>
    <UContainer>
        <Transition name="every">
            <div class="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center gap-3 z-10 pointer-events-none" v-if="isLoading">
                <UIcon name="i-ri-loader-5-fill" class="block animate-spin w-12 h-12"/>
                <p class="text-sm text-center">{{loadingMsg}}</p>
            </div>
            <div v-else>
                <h1 class="text-4xl font-semibold mb-1">{{entryData.title}}</h1>
                <p>主催者: {{entryData.author}}</p>
                <h2 class="text-2xl font-semibold my-2">詳細</h2>
                <h3 class="text-xl font-semibold mt-1 mb-px">期間</h3>
                <p>{{format(entryData.date.start,"yyy/M/d")}} - {{format(entryData.date.end,"yyy/M/d")}}</p>
                <h3 class="text-xl font-semibold mt-1 mb-px">説明</h3>
                <p class="min-h-4">{{entryData.description}}</p>
                <h2 class="text-2xl font-semibold my-2">空き日程</h2>
                <p v-if="entryData.data.length==0">(まだ誰も予定を入力していません)</p>
                <ul class="pl-6">
                    <li class="list-disc" v-for="match in matchList">{{match}}</li>
                </ul>
                <h2 class="text-2xl font-semibold my-2">参加者の予定</h2>
                <p v-if="entryData.data.length==0">(まだ誰も入力していません)</p>
                <div v-for="data,i in entryData.data">
                    <h3 class="text-xl font-semibold mt-1 mb-px">{{data.name}}さん</h3>
                    <div class="flex flex-row items-center gap-2" :class="data.empty?'text-lime-500':'text-gray-500'">
                        <UIcon :name="data.empty?'i-ri-calendar-check-fill':'i-ri-calendar-close-fill'"/>
                        <p>空欄: {{data.empty?'空き':'参加不可'}}</p>
                    </div>
                    <p>
                        備考:<br>
                        {{data.comment?data.comment:"(未入力)"}}
                    </p>
                    <UCard v-if="Array.isArray(data.schedule)" v-for="sc in data.schedule" :key="i" class="my-2">
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
                    </UCard>
                    <UButton class="mt-1" color="gray" icon="i-ri-edit-2-fill" :to="`/entries/${route.params.id}/edit/${i}`">予定を編集</UButton>
                </div>
                <UButton :to="`/entries/${route.params.id}/add`" block class="mt-4" icon="i-ri-calendar-schedule-line">自分の予定を入力</UButton>
                <UButton :to="`/entries/${route.params.id}/edit`" color="gray" block class="mt-2" icon="i-ri-edit-box-line">項目を編集</UButton>
                <br>
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
.miniload-leave-to{
    opacity:0;
}
.miniload-leave-active{
    transition:.3s all;
}
</style>