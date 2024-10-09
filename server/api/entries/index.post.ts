import {v4 as generateUUID} from "uuid";
export default defineEventHandler(async event=>{
    const id=generateUUID();
    const body=JSON.parse((await readRawBody(event))as string);
    await useStorage().setItem(`kv:${id}`,JSON.stringify(body));
    return id;
});
