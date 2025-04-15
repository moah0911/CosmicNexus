/**
 * Defines the types of cosmic entities in the application
 */
export const COSMIC_TYPES = {
  CONNECTION: 'connection',
  INSIGHT: 'insight',
  DISCOVERY: 'discovery'
};

/**
 * Defines the types of relationships between nodes
 */
export const RELATIONSHIP_TYPES = {
  RELATED: 'related',
  INFLUENCES: 'influences',
  CONTRASTS: 'contrasts',
  BUILDS_ON: 'builds_on',
  INSPIRES: 'inspires'
};

/**
 * Maps relationship types to their display names and icons
 */
export const RELATIONSHIP_DISPLAY = {
  related: {
    name: 'Related',
    icon: 'bi-link',
    description: 'These nodes share common themes, concepts, or elements'
  },
  influences: {
    name: 'Influences',
    icon: 'bi-arrow-right',
    description: 'The first node has a direct impact or influence on the second node'
  },
  contrasts: {
    name: 'Contrasts',
    icon: 'bi-arrow-left-right',
    description: 'These nodes represent opposing or contrasting ideas or approaches'
  },
  builds_on: {
    name: 'Builds On',
    icon: 'bi-building-up',
    description: 'The second node extends or builds upon concepts from the first node'
  },
  inspires: {
    name: 'Inspires',
    icon: 'bi-stars',
    description: 'The first node serves as inspiration or a creative catalyst for the second node'
  }
};

/**
 * Maps node categories to their display names and icons
 */
export const CATEGORY_DISPLAY = {
  art: { name: 'Art', icon: 'bi-palette' },
  science: { name: 'Science', icon: 'bi-atom' },
  history: { name: 'History', icon: 'bi-hourglass' },
  music: { name: 'Music', icon: 'bi-music-note-beamed' },
  literature: { name: 'Literature', icon: 'bi-book' },
  philosophy: { name: 'Philosophy', icon: 'bi-lightbulb' },
  technology: { name: 'Technology', icon: 'bi-cpu' },
  hobby: { name: 'Hobby', icon: 'bi-controller' },
  other: { name: 'Other', icon: 'bi-star' }
};

/**
 * Returns the appropriate icon for a given category
 */
export const getCategoryIcon = (category) => {
  return CATEGORY_DISPLAY[category]?.icon || 'bi-star';
};

/**
 * Returns the appropriate icon for a given relationship type
 */
export const getRelationshipIcon = (type) => {
  return RELATIONSHIP_DISPLAY[type]?.icon || 'bi-link';
};
