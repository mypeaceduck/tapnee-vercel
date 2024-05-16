const ProgressBar = ({ percentage }: any) => {
  const getColor = (percentage: any) => {
    const red = Math.round((100 - percentage) * 2.55);
    const green = Math.round(percentage * 2.55);
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <div className="w-full bg-gray-200 h-4 rounded-lg overflow-hidden">
      <div
        className="h-full rounded-lg shadow-md transition-all duration-500 ease-linear"
        style={{
          width: `${percentage}%`,
          backgroundColor: getColor(percentage),
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
