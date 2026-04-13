import type { JSX } from "react/jsx-dev-runtime";
import { Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { type MouseEvent } from "react";
import type { BasketballHoop, Coordinates } from "../../types/types";
import haversineDistance from "../../utils/functions";
import { useLocationValues } from "../../contexts/LocationContext.tsx";
import { useTranslation } from "../../hooks/useTranslation.ts";
import { HoopCardButton } from "./HoopCardButton.tsx";
import type { FocusableElement } from "@react-types/shared/src/dom";
import breakpoints from "../../assets/style.ts";
import { useMediaQuery } from "usehooks-ts";
import { getHoopImageUrl } from "../../services/requests.ts";

const MapMarkerPopup = ({ hoop }: { hoop: BasketballHoop }): JSX.Element => {
  const mapCenterValues: Coordinates = useLocationValues();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sm: boolean = useMediaQuery(`(min-width: ${breakpoints.sm})`);

  const readyToPlay = (e: MouseEvent<FocusableElement>) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/hoops/${hoop.id}`);
    };

  const distance: number = haversineDistance([mapCenterValues.latitude!, mapCenterValues.longitude!], [hoop.coordinates.latitude!, hoop.coordinates.longitude!], false);

  return (
    <div>
      <Popup 
        minWidth={150}
        maxWidth={sm ? 300 : 160}
        >
        <div>
          <div className="flex flex-col justify-start items-start mb-1">
            <strong className="text-fluid-base">{hoop.name}</strong>
            <span className="text-fluid-xs">{distance.toFixed(1)} km</span>
          </div>
          
          <img
            src={hoop.images.length > 0 ? getHoopImageUrl(hoop.images[0].imagePath) : 'https://via.placeholder.com/150'}
            alt={hoop.name}
            className="w-full h-auto mb-1" 
          />
        </div>
  
        <div className="flex flex-col justify-between items-center w-full gap-1.5">
          <div className="text-fluid-sm">
            {t('hoops.popupText', {
              courtType: t(hoop.isIndoor ? 'hoops.popupIndoor' : 'hoops.popupOutdoor'),
              condition: t(`hoops.popupCondition.${hoop.condition}`)
            })}
            {/* Add later when court details page is ready
            <Link to={`/hoops/${hoop.id}`}>View details</Link>
            */}
          </div>
          <HoopCardButton
            actionFunction={readyToPlay}
            title={t('hoops.hoopcardReadyToPlayButton')}
            colors="hoop-card-button-green"
            text="text-fluid-sm"
          />
        </div>
        
      </Popup>
    </div>
  );
}

export { MapMarkerPopup };