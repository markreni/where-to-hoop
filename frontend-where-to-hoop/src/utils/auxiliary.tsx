import { conditionColors }from "../assets/style";
import type { Condition } from "../types/types";

const conditionClass = (condition?: Condition) => {
  switch (condition) {
    case 'excellent': return conditionColors.excellent;
    case 'good':      return conditionColors.good;
    case 'fair':      return conditionColors.fair;
    case 'poor':      return conditionColors.poor;
    default:          return conditionColors.unknown;
  }
};

export { conditionClass };