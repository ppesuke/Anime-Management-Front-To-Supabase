import { useState,useEffect } from "react";
import { IPastAnime } from "../data/interface";
import { AnimePastListItem } from "./animePastListItem";
import { supabase } from '../../../lib/supabaseClient';
import { getPastAnime, pastAnimeEpisodeUp, pastAnimeFinishWatching } from '../../../lib/service/animePastService';
const AnimePastEntry = () => {
  const [pastAnime,setPastAnime] = useState<IPastAnime[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);
  
    const loadPastAnime = async () => {
      if (!user) return;
      
      try {
        const data = await getPastAnime(user.id);
        setPastAnime(data);
      } catch (error) {
        console.error("エラーが発生しました:", error);
        alert("エラーが発生しました。");
      }
    }
  
    const handleEpisodeUp = async (animeId : number) => {
      if (!user) return;
      
      try {
        await pastAnimeEpisodeUp(animeId, user.id);
        loadPastAnime();
      } catch (error) {
        console.error("エラーが発生しました:", error);
        alert("話数カウントに失敗しました。");
      }
    }

    const handleFinishWatching = async (animeId : number) => {
      if (!user) return;
      
      try {
        await pastAnimeFinishWatching(animeId, user.id);
        loadPastAnime();
      } catch (error) {
        console.error("エラーが発生しました:", error);
        alert("視聴終了に失敗しました。");
      }
    }
  
    const onEpisodeUp = (iPastAnime:IPastAnime) =>{
      handleEpisodeUp(iPastAnime.anime_id);
    }

    const onFinishWatching = async (iPastAnime:IPastAnime) => {
      handleFinishWatching(iPastAnime.anime_id);
    }
  
    useEffect(() => {
      if (user) {
        loadPastAnime();
      }
    }, [user])
  return (
    <div className="flex justify-center p-2 bg-gray-100 bg-opacity-50 min-h-full min-w-full">
      <div className="h-[calc(100vh-6rem)] w-full overflow-auto scrollbar-hide">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="bg-gray-100">
              <th className="px-1 py-1 text-xs md:px-4 md:py-2 md:text-base font-medium text-gray-700 text-center">種別</th>
              <th className="px-1 py-1 text-xs md:px-4 md:py-2 md:text-base font-medium text-gray-700 text-center">タイトル</th>
              <th className="px-1 py-1 text-xs md:px-4 md:py-2 md:text-base font-medium text-gray-700 text-center">視聴開始日</th>
              <th className="px-1 py-1 text-xs md:px-4 md:py-2 md:text-base font-medium text-gray-700 text-center">話数</th>
              <th className="px-1 py-1 text-xs md:px-4 md:py-2 md:text-base font-medium text-gray-700 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
          {pastAnime.map((pastAnimedata,index) => (
             <AnimePastListItem key={index} pastAnime={pastAnimedata} onclick={onEpisodeUp} onFinish={onFinishWatching}/>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnimePastEntry;