import { conditionColors }from "../assets/style";

const MapLabel = () => {
  return (
     <div className="absolute bottom-6 left-3 bg-white rounded-lg shadow-lg py-2 px-4 z-400">
          <h4 className="text-sm text-gray-700 mb-2"><strong>Court Condition</strong> </h4>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Excellent', color: conditionColors.excellent },
              { label: 'Good', color: conditionColors.good },
              { label: 'Fair', color: conditionColors.fair },
              { label: 'Poor', color: conditionColors.poor },
              { label: 'Unknown', color: conditionColors.unknown },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-white shadow ${item.color}`}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
      </div>
  );
}

export { MapLabel };