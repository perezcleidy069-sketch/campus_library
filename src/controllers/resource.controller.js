export function createResourceController(service) {
  return {
    list: async (req, res) => {
      const result = await service.list(req.query);
      res.json(result);
    },
    get: async (req, res) => {
      res.json({ data: await service.get(req.params.id) });
    },
    create: async (req, res) => {
      res.status(201).json({ data: await service.create(req.body) });
    },
    update: async (req, res) => {
      res.json({ data: await service.update(req.params.id, req.body) });
    },
    delete: async (req, res) => {
      await service.delete(req.params.id);
      res.status(204).end();
    },
  };
}
