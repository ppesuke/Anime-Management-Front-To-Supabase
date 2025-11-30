import { AnimePastListItemProps } from "../data/props";
export const AnimePastListItem : React.FC<AnimePastListItemProps> = ({pastAnime,onclick,onFinish}) => {

    const releaseDate = pastAnime.watching_start_date.split('T')[0];
    
    const formatAnimeName = (name: string) => {
        if (window.innerWidth >= 768) return name;
        if (name.length <= 10) return name;
        const chunks = [];
        for (let i = 0; i < name.length; i += 10) {
            chunks.push(name.slice(i, i + 10));
        }
        return chunks.join('\n');
    };
    const typeLabel = pastAnime.anime.anime_flg ? "アニメ" : "ドラマ";
    const animeName = formatAnimeName(pastAnime.anime.anime_name);
    const bgColor = pastAnime.anime.anime_flg ? "bg-blue-50" : "bg-pink-50";
    const hoverColor = pastAnime.anime.anime_flg ? "hover:bg-blue-100" : "hover:bg-pink-100";

    const onEpisodeUp = () => {
        onclick(pastAnime);
    }

    const onFinishAnime = () => {
        onFinish(pastAnime);
    }

    return (
        <tr className={`${bgColor} ${hoverColor}`}>
            <td className="!text-black px-1 py-1 text-center text-xs md:text-base whitespace-nowrap">{typeLabel}</td>
            <td className="!text-black px-1 py-1 text-xs md:text-base whitespace-pre md:whitespace-nowrap">{animeName}</td>
            <td className="!text-black px-1 py-1 text-center text-xs md:text-base whitespace-nowrap">{releaseDate}</td>
            <td className="!text-black px-1 py-1 text-center text-xs md:text-base whitespace-nowrap">{pastAnime.anime.episode}話</td>
            <td className="!text-black px-1 py-1 text-center whitespace-nowrap">
                <div className="flex flex-col md:flex-row gap-1 md:gap-4 md:justify-center">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-2 md:w-24 md:h-16 md:text-base rounded"
                        onClick={onEpisodeUp}>
                    視聴
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white text-xs py-1 px-2 md:w-24 md:h-16 md:text-base rounded"
                        onClick={onFinishAnime}>
                    終了
                    </button>
                </div>
            </td>
        </tr>
    );
};