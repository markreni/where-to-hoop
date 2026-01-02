import type { JSX } from "react/jsx-dev-runtime";
import { Popup } from "react-leaflet";
import type { BasketballHoop, Coordinates } from "../../types/types";
import { Link } from "react-router-dom";
import haversineDistance from "../../utils/functions";
import { useLocationValues } from "../../contexts/LocationContext.tsx";

const MapMarkerPopup = ({ hoop }: { hoop: BasketballHoop }): JSX.Element => {
  const mapCenterValues: Coordinates = useLocationValues();

  const distance = haversineDistance([mapCenterValues.latitude!, mapCenterValues.longitude!], [hoop.coordinates.latitude!, hoop.coordinates.longitude!], false);

  return (
    <div>
      <Popup 
        minWidth={250}
        maxWidth={500}
        >
        <div className="flex justify-between items-center mb-1">
          <strong>{hoop.name}</strong><br />
          <span>{distance.toFixed(1)} km</span>
        </div>
        
        <img
          src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
          alt={hoop.name}
          style={{ width: '100%', height: 'auto', marginBottom: '8px' }}
        />
        
        <div>
          {`${hoop.indoor ? "Indoor" : "Outdoor"} court which is in a`} <strong>{hoop.condition}</strong> condition <br /> 
          <Link to={`/hoops/${hoop.id}`}>View details</Link>
        </div>
      </Popup>  
    </div>
  );
}

export { MapMarkerPopup };