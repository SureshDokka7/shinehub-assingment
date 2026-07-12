export function createFleetController(repository) {
  return {
    async listDevices(req, res) {
      try {
        const devices = await repository.selectDevices(req.query);
        res.json({
          devices,
          total: devices.length,
          offlineCount: devices.filter((device) => device.onlineState === 'offline').length,
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },

    async listGroups(_req, res) {
      try {
        const groups = await repository.getGroups();
        res.json({ groups });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
  };
}

