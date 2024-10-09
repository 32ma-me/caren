<script setup lang="ts">
import {format} from "date-fns";
import type {EntryUserSchedule} from "@/interface/entry";
const sc:EntryUserSchedule=reactive({
    repeat:false,
    date:new Date(),
    time:["14:00","15:30"],
    type:false,
    comment:"全社MTG"
});
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
const isEditOpen=ref(false);
const seoMeta={
    title:"caren - 予定調整ツール",
    description:"独自の新しいUIを備え、様々なケースで簡単に使える、ユーザーフレンドリーな日程調整ツールです。",
};
useSeoMeta({
    title:seoMeta.title,
    description:seoMeta.description,
    ogTitle:seoMeta.title,
    ogDescription:seoMeta.description
});
</script>
<template>
    <UContainer>
        <div class="w-full h-[calc(100vh-6rem)] flex flex-col justify-center items-center text-center">
            <UCard class="card w-lg my-2 text-start">
                <div class="flex flex-row items-center gap-2 mb-3 text-gray-500">
                    <UIcon name="i-ri-calendar-close-fill"/>
                    <p>参加不可</p>
                </div>
                <p class="text-lg">
                    毎週水曜日 14:00 - 15:30
                </p>
                <p class="text-gray-500">"全社MTG"</p>
            </UCard>
            <p class="text-4xl font-semibold my-4">カレンダーのような、直感的な予定入力</p>
            <p>独自の新しいUIを備え、様々なケースで簡単に使える、ユーザーフレンドリーな日程調整ツールです。</p>
            <UButton to="/entries/new" icon="i-ri-sticky-note-add-fill" block size="md" class="my-4 text-lg max-w-96">予定を作成</UButton>
        </div>
        <h2 class="text-3xl font-semibold mt-2">特徴</h2>
        <p class="text-gray-500 mb-2">他となにが違うの？</p>
        <div class="grid md:grid-cols-5 gap-6 max-w-4xl items-center justify-items-center mx-auto">
            <p class="md:col-start-1 md:col-end-4">
                carenでは、出欠を入力する際、既存のアプリケーションのように「出席/欠席」のチェックボックスを用いるのではなく、参加者の「予定」をそのまま入力できる、特徴的なUIを用います。<br>
                これにより、時間単位での出欠を意識する必要がなくなり、より直感的に予定を入力できるようになります。<br>
                入力した予定はファイルとして保存することも可能なので、入力の手間をさらに減らせます。
            </p>
            <div class="text-center w-full max-w-96 md:max-w-full md:col-start-4 md:col-end-6 my-2">
                <p class="text-sm mb-1">↓お試しください↓</p>
                <UCard class="text-start">
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
                                <UButton color="white" icon="i-ri-edit-2-fill" @click="isEditOpen=true">編集</UButton>
                        </template>
                </UCard>
            </div>
        </div>
        <UModal v-model="isEditOpen">
            <UCard>
                <template #header>
                    <div class="flex justify-end items-center">
                        <h2 class="mr-auto text-2xl font-semibold">予定を編集</h2>
                        <iconButton mode="small" icon="i-ri-close-fill" label="閉じる" @onclick="isEditOpen=false"/>
                    </div>
                </template>
                <UForm :state="sc" class="space-y-4">
                    <UFormGroup label="種類" name="type">
                        <div class="flex flex-row items-center gap-1">
                            <UToggle v-model="sc.type" on-icon="i-ri-calendar-check-fill" off-icon="i-ri-calendar-close-fill"/>
                            {{sc.type?"空き":"参加不可"}}
                        </div>
                    </UFormGroup>
                    <UFormGroup label="毎週繰り返す" name="repeat">
                        <div class="flex flex-row items-center gap-1">
                            <UToggle v-model="sc.repeat" on-icon="i-ri-repeat-2-fill" off-icon="i-ri-repeat-fill"/>
                            {{sc.repeat?"はい":"いいえ"}}
                        </div>
                    </UFormGroup>
                    <UFormGroup label="日付" name="date">
                        <UPopover :popper="{ placement: 'bottom-start' }">
                            <UButton icon="i-ri-calendar-event-fill" :label="format(sc.date, 'd MMM, yyy')" />
                            <template #panel="{ close }">
                            <ClientOnly><DatePicker v-model="sc.date" is-required @close="close" /></ClientOnly>
                            </template>
                        </UPopover>
                    </UFormGroup>
                    <UFormGroup label="時刻" name="time">
                        <div class="flex items-center gap-auto w-full">
                            <UInputMenu class="w-5/12" v-model="sc.time[0]" :options="timesArray.filter((elem,i)=>i<47)"/>
                            <p class="mx-auto">-</p>
                            <UInputMenu class="w-5/12" v-model="sc.time[1]" :options="timesArray.slice(1)"/>
                        </div>
                    </UFormGroup>
                    <UFormGroup label="備考" name="comment">
                        <UTextarea v-model="sc.comment"/>
                    </UFormGroup>
                </UForm>
            </UCard>
        </UModal>
        <h2 class="text-3xl font-semibold mt-2">Q&A</h2>
        <p class="text-gray-500 mb-2">よくある質問</p>
        <UAccordion color="gray" variant="ghost" size="lg" class="max-w-4xl mx-auto" :items="[
            {
                label:'アカウント登録は必要ですか？',
                content:'サービスを利用するにあたって、アカウントの登録、および Google 等のアカウントでのログインは不要です。予定データを保存したい際は、ファイルへの書き出し機能をご利用ください。'
            },
            {
                label:'個人情報の入力は必要ですか？',
                content:'サービスの利用時に、氏名や年齢、性別、メールアドレスなどの個人情報を要求することはありません。予定を入力する際には、名前とパスワードの2つが必要になります。'
            },
            {
                label:'パスワードは何のために必要で、どのように管理されますか？',
                content:'予定や項目の編集・削除を行う際、入力した本人以外が編集できないようにするものです。サーバーに送信・記録されるパスワードの情報は、正しいパスワードかどうかだけを判断できるもので、パスワードそのものは端末にもサーバーにも保存されません。'
            },
            {
                label:'日本語以外の言語に対応する予定はありますか？',
                content:'申し訳ありませんが、日本語以外の言語は現在サポートしていません。'
            },
            {
                label:'挙動・表示などの不具合はどこに報告すればよいでしょうか？',
                content:'サイト上部の「お問い合わせ」ボタン (「!」マークの吹き出しアイコン) からフォームが開きます。メールアドレスを入力していただいたうえで、ご送信ください。開発者のメールアドレス contact@32ma.me からご返信いたします。'
            }
        ]">
            <template #item="{item}">

            </template>
        </UAccordion>
    </UContainer>
</template>

<style scoped>
@keyframes in{
    from{
        opacity:0;
        transform:translateY(20px);
        filter:blur(1px);
    }
    to{
        opacity:1;
        transform:none;
        filter:none;
    }
}
.card{
    animation:1s ease in;
}
</style>