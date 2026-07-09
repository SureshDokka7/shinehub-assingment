export function createHealthController() {
  return {
    show(_req, res) {
      res.json({ ok: true, service: 'shinehub-vpp-dispatch', now: new Date().toISOString() });
    },
  };
}

