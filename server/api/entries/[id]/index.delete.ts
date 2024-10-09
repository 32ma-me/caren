export default defineEventHandler(async event=>{
    const data=await useStorage().removeItem(`kv:${getRouterParam(event,"id")}`);
});