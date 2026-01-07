import type { Condition } from "../types/types";


const conditionColorSelector = (condition?: Condition) => {
  switch (condition) {
    case 'excellent': return 'hoop-icon--excellent';
    case 'good':      return 'hoop-icon--good';
    case 'fair':      return 'hoop-icon--fair';
    case 'poor':      return 'hoop-icon--poor';
    default:          return 'hoop-icon--poor';
  }
};

export const conditionOptions = [
  { label: 'Excellent', name: 'excellent' as Condition, color: conditionColorSelector ('excellent') },
  { label: 'Good', name: 'good' as Condition, color: conditionColorSelector ('good') },
  { label: 'Fair', name: 'fair' as Condition, color: conditionColorSelector ('fair') },
  { label: 'Poor', name: 'poor' as Condition, color: conditionColorSelector ('poor') },
];

export const doorOptions = [
  { label: 'Indoor', name: 'indoor' as "indoor" | "outdoor", color: 'bg-blue-500' }, 
  { label: 'Outdoor', name: 'outdoor' as "indoor" | "outdoor", color: 'bg-green-500' }
]


export { conditionColorSelector };