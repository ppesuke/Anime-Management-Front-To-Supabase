import React, { useState } from "react";
import { supabase } from '../../../lib/supabaseClient';

const AnimeRegistEntry = () => {
  const [isCurrentSeason, setIsCurrentSeason] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []); 
  const [formData, setFormData] = useState({
    animeName: "",
    favoriteCharacter: "",
    speed: "0",
    seasonType: "0",
    animeFlg: "1",
    ReleaseDate: "",
    deliveryWeekday: "1",
    deliveryTime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "seasonType") {
      setIsCurrentSeason(value === "1");
    }

    // 配信開始日が変更されたときに自動的に曜日を設定
    if (name === "ReleaseDate" && value) {
      const date = new Date(value);
      const dayOfWeek = date.getDay(); // 0=日曜日, 1=月曜日, ..., 6=土曜日
      // 配信曜日のフォーマットに変換: 1=月曜日, 2=火曜日, ..., 7=日曜日
      const deliveryWeekday = dayOfWeek === 0 ? "7" : dayOfWeek.toString();
      setFormData({ ...formData, [name]: value, deliveryWeekday });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('ログインしてください');
      return;
    }
    
    try {
      // 同名作品のチェック
      const { data: existingAnime, error: checkError } = await supabase
        .from('anime')
        .select('anime_name')
        .eq('user_id', user.id)
        .eq('anime_name', formData.animeName)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingAnime) {
        alert('同じ名前の作品が既に登録されています');
        return;
      }
      
      // 作品テーブルに挿入
      const { data: animeData, error: animeError } = await supabase
        .from('anime')
        .insert({
          user_id: user.id,
          anime_name: formData.animeName,
          episode: 0,
          favoritecharacter: formData.favoriteCharacter,
          speed: formData.speed === "1",
          anime_flg: formData.animeFlg === "1"
        })
        .select()
        .single();
        
      if (animeError) throw animeError;
      
      // 今期作品の場合、current_animeテーブルにも挿入
      if (formData.seasonType === "1") {
        const currentDate = new Date();
        const { error: currentError } = await supabase
          .from('current_anime')
          .insert({
            anime_id: animeData.anime_id,
            user_id: user.id,
            year: currentDate.getFullYear(),
            season: Math.ceil((currentDate.getMonth() + 1) / 3).toString(),
            releasedate: formData.ReleaseDate,
            delivery_weekday: formData.deliveryWeekday,
            delivery_time: formData.deliveryTime
          });
          
        if (currentError) throw currentError;
      } else {
        // 過去作品の場合、past_animeテーブルに挿入
        // watching_start_dateはデフォルト値として0000-01-01を設定し、1話初回入力時に更新する
        const { error: pastError } = await supabase
          .from('past_anime')
          .insert({
            anime_id: animeData.anime_id,
            user_id: user.id,
            watching_start_date: '0000-01-01'
          });
          
        if (pastError) throw pastError;
      }
      
      alert("登録が成功しました！");
      setIsCurrentSeason(false);
      setFormData({
        animeName: "",
        favoriteCharacter: "",
        speed: "0",
        seasonType: "0",
        animeFlg: "1",
        ReleaseDate: "",
        deliveryWeekday: "1",
        deliveryTime: "",
      });
    } catch (error) {
      console.log(error);
      alert('登録に失敗しました');
    }
  };

  return (
    <div className="flex justify-center items-center p-8 bg-gray-100 bg-opacity-50 min-h-full min-w-full">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-black mb-6 text-center">
          登録
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>

          <div>
            <label
              htmlFor="animeName"
              className="block text-sm font-medium text-black"
            >
              作品名
            </label>
            <input
              type="text"
              id="animeName"
              name="animeName"
              value={formData.animeName}
              onChange={handleChange}
              placeholder="作品名を入力"
              className="!text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>


          <div>
            <label
              htmlFor="favoriteCharacter"
              className="block text-sm font-medium text-black"
            >
              お気に入りのキャラ
            </label>
            <input
              type="text"
              id="favoriteCharacter"
              name="favoriteCharacter"
              value={formData.favoriteCharacter}
              onChange={handleChange}
              placeholder="お気に入りのキャラを入力"
              className="!text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>


          <div>
            <label
              htmlFor="animeFlg"
              className="block text-sm font-medium text-black"
            >
              種別
            </label>
            <select
              id="animeFlg"
              name="animeFlg"
              value={formData.animeFlg}
              onChange={handleChange}
              className="!text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="1">アニメ</option>
              <option value="0">ドラマ</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="speed"
              className="block text-sm font-medium text-black"
            >
              再生速度
            </label>
            <select
              id="speed"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
              className="!text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="0">等速</option>
              <option value="1">倍速</option>
            </select>
          </div>


          <div>
            <label
              htmlFor="seasonType"
              className="block text-sm font-medium text-black"
            >
              作品の時期
            </label>
            <select
              id="seasonType"
              name="seasonType"
              value={formData.seasonType}
              onChange={handleChange}
              className="!text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="0">過去の作品</option>
              <option value="1">今期の作品</option>
            </select>
          </div>


          {isCurrentSeason && (
            <>
              <div>
                <label
                  htmlFor="ReleaseDate"
                  className="block text-sm font-medium text-black"
                >
                  配信開始日
                </label>
                <input
                  type="date"
                  id="ReleaseDate"
                  name="ReleaseDate"
                  value={formData.ReleaseDate}
                  onChange={handleChange}
                  className="!text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="deliveryWeekday"
                  className="block text-sm font-medium text-black"
                >
                  配信曜日
                </label>
                <select
                  id="deliveryWeekday"
                  name="deliveryWeekday"
                  value={formData.deliveryWeekday}
                  onChange={handleChange}
                  className="!text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="1">月曜日</option>
                  <option value="2">火曜日</option>
                  <option value="3">水曜日</option>
                  <option value="4">木曜日</option>
                  <option value="5">金曜日</option>
                  <option value="6">土曜日</option>
                  <option value="7">日曜日</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="deliveryTime"
                  className="block text-sm font-medium text-black"
                >
                  配信時間
                </label>
                <input
                  type="time"
                  id="deliveryTime"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  className="!text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnimeRegistEntry;
