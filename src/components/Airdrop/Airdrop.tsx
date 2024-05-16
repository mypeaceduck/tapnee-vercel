import { GiFireworkRocket } from "react-icons/gi";

const Airdrop = ({ active }: { active: boolean }) => {
  return (
    <>
      <h2 className="text-2xl font-extrabold w-full text-center underline underline-offset-8 mb-6">
        Airdrop
      </h2>
      <div className="flex justify-around items-center gap-2 w-full">
        <div className="flex flex-col justify-around items-center gap-2">
          <div className="text-white/50">
            Task:{" "}
            <span className="text-white">Activate the secret combination</span>
          </div>
          <div className="bg-black/20 rounded-xl p-10">
            <GiFireworkRocket className="w-20 h-20" />
          </div>
          <div>
            Your Reward:{" "}
            {active ? (
              <span className="text-yellow-200">1,000 $TAP</span>
            ) : (
              <span className="text-white/50">?,??? $TAP</span>
            )}
          </div>
          <div>
            <button
              className={`btn btn-md ${
                active ? `btn-success` : `btn-neutral btn-disabled`
              }`}
            >
              Claim $TAP
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Airdrop;
