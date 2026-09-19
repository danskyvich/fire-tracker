export default function AqiInfo() {
    const AQI_COLORS = [
      { id: "good", color: "bg-[#028459]", value: "Good", range: "0-50" },
      {
        id: "moderate",
        color: "bg-[#dbbf2d] text-black",
        value: "Moderate",
        range: "51-100",
      },
      {
        id: "unhealthy/s",
        color: "bg-[#db842d] text-black",
        value: "Unhealthy for sensitive groups",
        range: "101-150",
      },
      {
        id: "unhealthy",
        color: "bg-[#af022d]",
        value: "Unhealthy",
        range: "151-200",
      },
      {
        id: "very-unhealthy",
        color: "bg-[#590284]",
        value: "Very unhealthy",
        range: "201-300",
      },
      {
        id: "hazardous",
        color: "bg-[#6d0220]",
        value: "Hazardous",
        range: "300+",
      },
    ];
    return (
      <div className="flex flex-col w-69 md:w-70 h-fit absolute z-50 pointer-events-auto rounded-lg bg-background/75 p-3 bottom-14 right-4 border border-white/25 gap-2">
        <p className="font-sans font-light">Air Quality Index </p>
        <div className="grid grid-cols-[27%_1fr] gap-x-4 grid-rows-6 w-full h-full items-center justify-center">
          {AQI_COLORS.map((item) => (
            <div key={item.id} className="contents">
              <div className={`flex items-center justify-center w-full px-1 py-0.5 ${item.color} font-sans tracking-tighter text-sm rounded-md`}>
                <p className="text-[0.8rem]">{item.range}</p>
              </div>
              <p className="text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
}