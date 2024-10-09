import type {Entry} from "@/interface/entry";
export default defineEventHandler(async event=>{
    const data=await useStorage().getItem(`kv:${getRouterParam(event,"id")}`) as Entry;
    return data;
});