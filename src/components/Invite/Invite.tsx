const Invite = () => {
  return (
    <>
      <h2 className="text-2xl font-extrabold w-full text-center underline underline-offset-8 mb-6">
        Invite
      </h2>
      <div className="flex flex-col justify-around items-start gap-2 w-full p-4">
        <div className="rounded-3xl bg-black/20 p-4 w-full text-center grid place-items-center">
          Send For Friends:{" "}
          <div className="text-green-400 text-md px-6 py-2 rounded-xl bg-black/90 max-w-fit">
            https://tapnee.com/u234
          </div>
        </div>
        <div className="font-extrabold">Your Friends:</div>
        <div>
          1. <span className="text-white/50">Tilda</span>{" "}
          <small className="text-green-400/50 text-xs">+1,000 $TAP</small>
        </div>
        <div>
          2. <span className="text-white/50">Bob</span>{" "}
          <small className="text-green-400/50 text-xs">+1,000 $TAP</small>
        </div>
        <div>
          3. <span className="text-white/50">Alice</span>{" "}
          <small className="text-green-400/50 text-xs">+1,000 $TAP</small>
        </div>
      </div>
    </>
  );
};

export default Invite;
