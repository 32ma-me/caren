import type {Entry} from "@/interface/entry"
export default defineEventHandler(async event=>{
    const body=JSON.parse((await readRawBody(event))as string);
    let entry=await useStorage().getItem(`kv:${getRouterParam(event,"id")}`) as Entry;
    await useStorage().setItem(`kv:${getRouterParam(event,"id")}`,JSON.stringify({...entry,...body}));
});