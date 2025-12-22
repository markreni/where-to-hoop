import type { JSX } from "react/jsx-dev-runtime";
import { Popup } from "react-leaflet";
import type { BasketballHoop } from "../../types/types";
import { Link } from "react-router-dom";

const MapMarkerPopup = ({ hoop }: { hoop: BasketballHoop }): JSX.Element => {
  return (
    <div>
      <Popup 
        minWidth={250}
        maxWidth={500}
        >
        <div className="flex justify-between items-center mb-1">
          <strong>{hoop.name}</strong><br />
          <Link to={`/hoops/${hoop.id}`}>View details</Link>
        </div>
        
        <img
          src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
          alt={hoop.name}
          style={{ width: '100%', height: 'auto', marginBottom: '8px' }}
        />
        
        {`${hoop.indoor ? "Indoor" : "Outdoor"} court which is in a`} <strong>{hoop.condition}</strong> condition <br /> 
      </Popup>  
    </div>
  );
}

export { MapMarkerPopup };