export const MASTER_ITEMS = [
  // LAPOTHARA items
  { name: 'LSLCN800', category: 'LAPOTHARA' },
  { name: 'LD51LUX', category: 'LAPOTHARA' },
  { name: 'L16', category: 'LAPOTHARA' },
  { name: 'L24', category: 'LAPOTHARA' },
  { name: 'L36', category: 'LAPOTHARA' },
  { name: 'L46', category: 'LAPOTHARA' },
  { name: 'L60', category: 'LAPOTHARA' },
  { name: 'L120D', category: 'LAPOTHARA' },
  { name: 'L270', category: 'LAPOTHARA' },
  { name: 'L500', category: 'LAPOTHARA' },
  { name: 'L240', category: 'LAPOTHARA' },
  { name: 'L800', category: 'LAPOTHARA' },
  { name: 'L1000', category: 'LAPOTHARA' },
  { name: 'L320', category: 'LAPOTHARA' },
  { name: 'LS6MFINAL', category: 'LAPOTHARA' },
];

// Clean name helper function
export const getCleanName = (name) => {
  return name.replace(/\s+/g, '').toUpperCase();
};

// Enrich master items with clean names
export const ENRICHED_MASTER_ITEMS = MASTER_ITEMS.map((item) => ({
  ...item,
  cleanName: getCleanName(item.name),
}));
