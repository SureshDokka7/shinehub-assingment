const regions = ['NSW', 'VIC', 'QLD', 'SA', 'TAS'];
const vendors = ['Tesla', 'Sonnen', 'BYD', 'AlphaESS'];

const capabilitiesByVendor = {
  Tesla: ['discharge', 'charge', 'curtail_solar'],
  Sonnen: ['discharge', 'charge'],
  BYD: ['discharge', 'curtail_solar'],
  AlphaESS: ['discharge', 'charge', 'curtail_solar'],
};

export function createSeedDevices() {
  return Array.from({ length: 180 }, (_, index) => {
    const vendor = vendors[index % vendors.length];
    const region = regions[index % regions.length];
    const mostlyOnline = index % 23 !== 0 && index % 31 !== 0;

    return {
      id: `dev-${String(index + 1).padStart(4, '0')}`,
      siteId: `SITE-${String(4100 + index)}`,
      region,
      vendor,
      onlineState: mostlyOnline ? 'online' : 'offline',
      capabilities: capabilitiesByVendor[vendor],
      lastSeenAt: new Date(Date.now() - (index % 18) * 60_000).toISOString(),
    };
  });
}

export function createSeedGroups() {
  return [
    { id: 'group-fcas-nsw', name: 'NSW FCAS Ready', selector: { region: 'NSW' } },
    { id: 'group-battery-vic', name: 'VIC Battery Fleet', selector: { region: 'VIC' } },
    { id: 'group-alphaess', name: 'AlphaESS Rollout', selector: { vendor: 'AlphaESS' } },
  ];
}

