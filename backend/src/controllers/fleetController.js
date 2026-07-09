export function createFleetController(repository) {
  return {
    listDevices(req, res) {
      const devices = repository.selectDevices(req.query);
      res.json({
        devices,
        total: devices.length,
        offlineCount: devices.filter((device) => device.onlineState === 'offline').length,
      });
    },

    listGroups(_req, res) {
      res.json({ groups: repository.getGroups() });
    },
  };
}

