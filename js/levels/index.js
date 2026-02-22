import { build as socialMediaScam } from './social-media-scam.js';

// Level Registry
const levels = {
  'social-media-scam': socialMediaScam,
  // ... other levels
};

export function getLevel(id) {
  return levels[id];
}

export const levelIds = Object.keys(levels);
