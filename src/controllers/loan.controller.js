export function createLoanController(service) {
  return {
    list: async (req, res) => res.json(await service.list(req.query)),
    get: async (req, res) => res.json({ data: await service.get(req.params.id) }),
    create: async (req, res) => res.status(201).json({ data: await service.create(req.body) }),
    returnBook: async (req, res) => res.json({ message: await service.returnBook(req.params.id) }),
    delete: async (req, res) => {
      await service.delete(req.params.id);
      res.status(204).end();
    },
  };
}
