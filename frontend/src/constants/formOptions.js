export const eventTypes = [
  { value: 'discharge', label: 'Discharge' },
  { value: 'charge', label: 'Charge' },
  { value: 'curtail_solar', label: 'Curtail solar' },
];

export const regions = ['NSW', 'VIC', 'QLD', 'SA', 'TAS'];
export const vendors = ['Tesla', 'Sonnen', 'BYD', 'AlphaESS'];

export const retryableStatuses = ['publish_failed', 'ack_timeout', 'execution_timeout', 'execution_failed', 'offline_expired'];

