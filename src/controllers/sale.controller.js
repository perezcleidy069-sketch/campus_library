export function createSaleController(service) {
  return {
    list: async (req, res) => res.json(await service.list(req.query)),
    get: async (req, res) => res.json({ data: await service.get(req.params.id) }),
    create: async (req, res) => res.status(201).json({ data: await service.create(req.body) }),
    delete: async (req, res) => {
      await service.delete(req.params.id);
      res.status(204).end();
    },
  };
}
