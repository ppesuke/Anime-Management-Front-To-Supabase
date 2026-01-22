import { supabase } from '../supabaseClient';
import { IPastAnime } from '../../app/component/data/interface';
import { addWatchHistory } from './watchHistoryService';

export const getPastAnime = async (userId: string): Promise<IPastAnime[]> => {
  const { data, error } = await supabase
    .from('past_anime')
    .select(`
      *,
      anime!inner(*)
    `)
    .eq('anime.user_id', userId)
    .order('anime(episode)', { ascending: false })
    .order('anime(anime_name)', { ascending: true });
    
  if (error) throw error;
  
  return data.map((item: any) => ({
    id: item.id,
    anime_id: item.anime_id,
    watching_start_date: item.watching_start_date,
    anime: {
      id: item.anime.id,
      user_id: item.anime.user_id,
      anime_name: item.anime.anime_name,
      episode: item.anime.episode,
      favoritecharacter: item.anime.favoritecharacter,
      speed: item.anime.speed,
      anime_flg: item.anime.anime_flg ?? true,
    },
  }));
};

export const pastAnimeEpisodeUp = async (animeId: number, userId: string): Promise<void> => {
  const { data: currentData, error: fetchError } = await supabase
    .from('anime')
    .select('episode')
    .eq('anime_id', animeId)
    .single();

  if (fetchError) throw fetchError;

  const newEpisode = currentData.episode + 1;

  const { error } = await supabase
    .from('anime')
    .update({ episode: newEpisode })
    .eq('anime_id', animeId);

  if (error) throw error;

  // 1話を初めて入力した場合、watching_start_dateを現在日付に更新
  if (newEpisode === 1) {
    const { error: updateStartDateError } = await supabase
      .from('past_anime')
      .update({ watching_start_date: new Date().toISOString().split('T')[0] })
      .eq('anime_id', animeId);

    if (updateStartDateError) throw updateStartDateError;
  }

  await addWatchHistory(animeId, userId, newEpisode);
};

export const deletePastAnime = async (animeId: number): Promise<void> => {
  // past_animeから削除
  const { error: deletePastError } = await supabase
    .from('past_anime')
    .delete()
    .eq('anime_id', animeId);

  if (deletePastError) throw deletePastError;

  // animeテーブルから削除
  const { error: deleteAnimeError } = await supabase
    .from('anime')
    .delete()
    .eq('anime_id', animeId);

  if (deleteAnimeError) throw deleteAnimeError;
};

export const pastAnimeFinishWatching = async (animeId: number, userId: string): Promise<void> => {
  const { data: animeData, error: fetchError } = await supabase
    .from('anime')
    .select('view_count')
    .eq('anime_id', animeId)
    .single();
    
  if (fetchError) throw fetchError;
  
  const currentCount = animeData.view_count || 0;
  const { error: updateError } = await supabase
    .from('anime')
    .update({ 
      view_count: currentCount + 1,
      episode: 0
    })
    .eq('anime_id', animeId);
    
  if (updateError) throw updateError;
  
  const { error: deleteError } = await supabase
    .from('past_anime')
    .delete()
    .eq('anime_id', animeId);
    
  if (deleteError) throw deleteError;
  
  const { error: insertError } = await supabase
    .from('viewed_anime')
    .insert({
      anime_id: animeId,
      user_id: userId,
      viewed_end_date: new Date().toISOString()
    });
    
  if (insertError) throw insertError;
  
  // アニメ視聴終了日テーブルに登録
  const { error: endDateError } = await supabase
    .from('anime_viewing_end_dates')
    .insert({
      anime_id: animeId,
      user_id: userId,
      day: new Date().toISOString().split('T')[0]
    });
    
  if (endDateError) throw endDateError;
};