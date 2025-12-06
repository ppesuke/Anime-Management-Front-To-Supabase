import { AnimeViewedListItemProps } from "../data/props";
export const AnimeViewedListItem : React.FC<AnimeViewedListItemProps> = ({viewedAnime,onReturn}) => {

    // 日付を取得
    const endDate = new Date(viewedAnime.viewed_end_date);

    const formatAnimeName = (name: string) => {
        if (window.innerWidth >= 768) return name;
        if (name.length <= 10) return name;
        const chunks = [];
        for (let i = 0; i < name.length; i += 10) {
            chunks.push(name.slice(i, i + 10));
        }
        return chunks.join('\n');
    };
    const typeLabel = viewedAnime.anime.anime_flg ? "アニメ" : "ドラマ";
    const animeName = formatAnimeName(viewedAnime.anime.anime_name);
    const bgColor = viewedAnime.anime.anime_flg ? "bg-blue-50" : "bg-pink-50";
    const hoverColor = viewedAnime.anime.anime_flg ? "hover:bg-blue-100" : "hover:bg-pink-100";
    const year = endDate.getFullYear();
    const month = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const day = endDate.getDate().toString().padStart(2, '0');

    const releaseDate = `${year}-${month}-${day}`;

    const onAgain = () => {
        onReturn(viewedAnime);
    }

    return (
        <tr className={`${bgColor} ${hoverColor}`}>
            <td className="!text-black px-1 py-1 text-center text-xs md:text-base whitespace-nowrap">{typeLabel}</td>
            <td className="!text-black px-1 py-1 text-xs md:text-base whitespace-pre md:whitespace-nowrap">{animeName}</td>
            <td className="!text-black px-1 py-1 text-center text-xs md:text-base whitespace-nowrap">{releaseDate}</td>
            <td className="!text-black px-1 py-1 text-center text-xs md:text-base whitespace-nowrap">{viewedAnime.anime.view_count || 1}</td>
            <td className="!text-black px-1 py-1 text-center whitespace-nowrap">
                <div className="flex justify-center">
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white text-xs py-1 px-2 md:w-24 md:h-16 md:text-base rounded"
                        onClick={onAgain}>
                    再視聴
                    </button>
                </div>
            </td>
        </tr>
    );
};