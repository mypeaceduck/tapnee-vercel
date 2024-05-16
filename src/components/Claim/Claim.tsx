import Logo from "../Logo";

const Claim = () => {
  return (
    <>
      <h2 className="text-2xl font-extrabold w-full text-center underline underline-offset-8 mb-6">
        Daily Claim
      </h2>
      <div className="flex justify-around items-center gap-2 w-full">
        <div className="flex flex-col justify-around items-center gap-2">
          <div className="bg-black/20 rounded-xl p-10">
            <div className="w-28 h-28">
              <Logo opacity={1} />
            </div>
          </div>
          <div>
            Claim <span className="text-md text-yellow-200">10,000 $TAP</span>
          </div>
          <div>
            <button className="btn btn-primary btn-md">
              Claim for 0.001 TON
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Claim;
