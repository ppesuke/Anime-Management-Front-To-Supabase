export interface IContent{
    content:string,
    contentName:string
}

export interface IAnime{
    id:number,
    user_id:string,
    anime_name:string,
    episode:number,
    favoritecharacter:string,
    speed:boolean,
    anime_flg:boolean,
    view_count?:number,
    created_at?:string,
    updated_at?:string
}

export interface ICurrentAnime{
    id?:number,
    anime_id:number,
    year:number,
    season:'1' | '2' | '3' | '4',
    releasedate:string,
    delivery_weekday:'1' | '2' | '3' | '4' | '5' | '6' | '7',
    delivery_time:string,
    created_at?:string,
    anime:IAnime,
}

export interface IPastAnime{
    id?:number,
    anime_id:number,
    watching_start_date:string,
    created_at?:string,
    anime:IAnime
}

export interface IViewedAnime{
    id?:number,
    anime_id:number,
    viewed_end_date:string,
    created_at?:string,
    anime:IAnime
}

export interface IAnimeWatchHistory{
    anime_id:number,
    user_id:string,
    history_id:string,
    episode:number,
    created_at?:string,
    updated_at?:string
}