interface DateObject{
    [key:string]:Date|DateObject|any;
}
export function stringifyDate(obj:DateObject):any{
    if(obj instanceof Date){
        return obj.toISOString();
    }
    if(Array.isArray(obj)){
        return obj.map(stringifyDate)
    }
    if(typeof obj=="object"&&obj){
        return Object.fromEntries(Object.entries(obj).map(([key,value])=>[key,stringifyDate(value)]));
    }
    return obj;
}
export function parseDate(obj:DateObject):any{
    if(typeof obj=="string"){
        const date=new Date(obj);
        if(!isNaN(date.getTime())){
            return date;
        }
    }
    if(Array.isArray(obj)){
        return obj.map(parseDate)
    }
    if(typeof obj=="object"&&obj){
        return Object.fromEntries(Object.entries(obj).map(([key,value])=>[key,parseDate(value)]));
    }
    return obj;
}