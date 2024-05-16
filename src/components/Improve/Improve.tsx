import { GiDoubleDragon, GiSpeedometer } from "react-icons/gi";

const Improve = () => {
  return (
    <>
      <h2 className="text-2xl font-extrabold w-full text-center underline underline-offset-8 mb-6">
        Improve
      </h2>
      <div className="flex justify-around items-center gap-2 w-full">
        <div className="rounded-3xl bg-black/30 hover:bg-black/60 hover:cursor-pointer text-white p-6 w-1/2 grid place-items-center gap-4">
          <GiSpeedometer className="text-6xl" />
          <div>
            Without Limit
            <div className="text-sm text-yellow-200 text-center">
              10,000 $TAP
            </div>
            <div className="text-xs text-white/20 text-center">24 hours</div>
          </div>
        </div>
        <div className="rounded-3xl bg-black/30 hover:bg-black/60 hover:cursor-pointer text-white p-6 w-1/2 grid place-items-center gap-4">
          <GiDoubleDragon className="text-6xl" />
          <div>
            Each Slaps x2
            <div className="text-sm text-yellow-200 text-center">
              5,000 $TAP
            </div>
            <div className="text-xs text-white/20 text-center">24 hours</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Improve;
