export interface Entry{
    title:string,
    key:string|HashedPassword|Promise<HashedPassword>,
    description?:string,
    author:string,
    date:{start:Date,end:Date},
    data:EntryUserData[]
}
export interface EntryUserData{
    name:string,
    key:string|HashedPassword|Promise<HashedPassword>,
    empty:boolean,
    comment:string,
    schedule:EntryUserSchedule[]
}
export interface EntryUserSchedule{
    repeat:boolean,
    date:Date,
    time:[string,string],
    type:boolean,
    comment:string
}