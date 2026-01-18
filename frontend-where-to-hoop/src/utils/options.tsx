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
  { labelKey: 'common.excellent', name: 'excellent' as Condition, color: conditionColorSelector ('excellent') },
  { labelKey: 'common.good', name: 'good' as Condition, color: conditionColorSelector ('good') },
  { labelKey: 'common.fair', name: 'fair' as Condition, color: conditionColorSelector ('fair') },
  { labelKey: 'common.poor', name: 'poor' as Condition, color: conditionColorSelector ('poor') },
];

export const doorOptions = [
  { labelKey: 'common.indoor', name: 'indoor' as "indoor" | "outdoor", color: 'bg-blue-500' },
  { labelKey: 'common.outdoor', name: 'outdoor' as "indoor" | "outdoor", color: 'bg-green-500' }
]


export { conditionColorSelector };