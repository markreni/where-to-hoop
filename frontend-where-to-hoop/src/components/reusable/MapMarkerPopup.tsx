import type { JSX } from "react/jsx-dev-runtime";
import { Popup } from "react-leaflet";
import type { BasketballHoop, ColorMode, Coordinates } from "../../types/types";
//import { Link } from "react-router-dom";
import haversineDistance from "../../utils/functions";
import { useLocationValues } from "../../contexts/LocationContext.tsx";
import { Button } from "react-aria-components";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import { useTranslation } from "../../hooks/useTranslation.ts";

const MapMarkerPopup = ({ hoop }: { hoop: BasketballHoop }): JSX.Element => {
  const mapCenterValues: Coordinates = useLocationValues();
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();

  const distance: number = haversineDistance([mapCenterValues.latitude!, mapCenterValues.longitude!], [hoop.coordinates.latitude!, hoop.coordinates.longitude!], false);

  return (
    <div>
      <Popup 
        minWidth={250}
        maxWidth={500}
        >
        <div className="flex justify-between items-center mb-1">
          <strong className="text-fluid-base">{hoop.name}</strong><br />
          <span className="text-fluid-sm">{distance.toFixed(1)} km</span>
        </div>
        
        <img
          src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
          alt={hoop.name}
          style={{ width: '100%', height: 'auto', marginBottom: '8px' }}
        />
  
        <div className="flex justify-between items-start gap-2">
          <div className="text-fluid-sm">
            {`${hoop.isIndoor ? "Indoor" : "Outdoor"} court in a`} <strong>{hoop.condition}</strong> condition <br /> 
            {/* Add later when court details page is ready
            <Link to={`/hoops/${hoop.id}`}>View details</Link>
            */}
          </div>
          <Button 
            className={`${colorModeContext} flex items-center gap-2 padding-y-for-elements padding-x-for-elements border-2 shadow-lg hoop-card-button-green rounded-xl transition-colors text-fluid-sm whitespace-nowrap cursor-pointer`}
              onClick={(e) => () => {
                e.preventDefault();
                console.log(`Locating hoop ${hoop.name} on map`);
              }}
              >
              {/*<IoMapOutline size={16} /> --- IGNORE ---*/}
              {t('hoops.hoopcardReadyToPlayButton')}
          </Button>
        </div>
        
      </Popup>  
    </div>
  );
}

export { MapMarkerPopup };