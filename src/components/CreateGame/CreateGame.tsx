const CreateGame = () => {
  return (
    <>
      <h2 className="text-2xl font-extrabold w-full text-center underline underline-offset-8 mb-6">
        Create Game
      </h2>
      <div className="flex flex-col justify-around items-center gap-2 w-full">
        <div className="w-full">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Tapnee Metadata:</span>
              <span className="label-text-alt"></span>
            </div>
            <input
              type="text"
              placeholder="ipfs://Qm..."
              className="input input-bordered w-full bg-transparent"
            />
            <div className="label">
              <span className="label-text-alt"></span>
              <span className="label-text-alt">
                <a
                  href=""
                  className="underline underline-offset-2 decoration-dotted"
                >
                  What is Tapnee Metadata?
                </a>
              </span>
            </div>
          </label>
        </div>
        <button className="btn btn-info">Create Game</button>
      </div>
    </>
  );
};

export default CreateGame;
