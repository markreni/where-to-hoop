import type { Condition } from "../types/types";


export const conditionColors = {
  excellent: 'hoop-icon--excellent', 
  good:      'hoop-icon--good',
  fair:      'hoop-icon--fair',
  poor:      'hoop-icon--poor',
  unknown:   'hoop-icon--unknown'
};

const conditionColorSelector = (condition?: Condition) => {
  switch (condition) {
    case 'excellent': return conditionColors.excellent;
    case 'good':      return conditionColors.good;
    case 'fair':      return conditionColors.fair;
    case 'poor':      return conditionColors.poor;
    default:          return conditionColors.unknown;
  }
};

export const conditionOptions = [
  { label: 'Excellent', condition: 'excellent' as Condition, color: conditionColors.excellent },
  { label: 'Good', condition: 'good' as Condition, color: conditionColors.good },
  { label: 'Fair', condition: 'fair' as Condition, color: conditionColors.fair },
  { label: 'Poor', condition: 'poor' as Condition, color: conditionColors.poor },
  { label: 'Unknown', condition: 'unknown' as Condition, color: conditionColors.unknown },
]

export { conditionColorSelector };