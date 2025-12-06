import { useState, useEffect } from "react";
import { supabase } from '../../../lib/supabaseClient';
import { getWatchHistoryByDate } from '../../../lib/service/watchHistoryService';

const WatchHistoryEntry = () => {
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);
  // 日本標準時間（JST）で今日の日付を取得
  const getJSTDate = () => {
    const now = new Date();
    // UTCから日本時間（UTC+9）に変換
    const jstOffset = 9 * 60; // 9時間 = 540分
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    return jstTime.toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState<string>(getJSTDate());

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const loadWatchHistory = async () => {
    if (!user) return;
    
    try {
      const data = await getWatchHistoryByDate(user.id, selectedDate);
      setWatchHistory(data);
    } catch (error) {
      console.error("エラーが発生しました:", error);
      alert("エラーが発生しました。");
    }
  };

  useEffect(() => {
    if (user) {
      loadWatchHistory();
    }
  }, [user, selectedDate]);

  return (
    <div className="flex flex-col p-2 bg-gray-100 bg-opacity-50 min-h-full min-w-full">
      <div className="mb-4 flex justify-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-black"
        />
      </div>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto scrollbar-hide">
        <table className="table-fixed w-full border-collapse border border-gray-300">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="bg-gray-100">
              <th className="w-1/2 px-1 py-1 text-xs md:px-4 md:py-2 md:text-base font-medium text-gray-700 text-center">アニメタイトル</th>
              <th className="w-1/4 px-1 py-1 text-xs md:px-4 md:py-2 md:text-base font-medium text-gray-700 text-center">話数</th>
              <th className="w-1/4 px-1 py-1 text-xs md:px-4 md:py-2 md:text-base font-medium text-gray-700 text-center">視聴日時</th>
            </tr>
          </thead>
          <tbody>
            {watchHistory.map((history, index) => (
              <tr key={index} className="bg-white hover:bg-gray-100">
                <td className="!text-black px-1 py-1 text-xs md:text-base text-center">{history.anime?.anime_name || 'N/A'}</td>
                <td className="!text-black px-1 py-1 text-xs md:text-base text-center">{history.episode}話</td>
                <td className="!text-black px-1 py-1 text-xs md:text-base text-center">
                  {history.created_at ? new Date(history.created_at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WatchHistoryEntry;