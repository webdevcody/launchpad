import { ShuttleHandler } from "../..";

const handler: ShuttleHandler = async ({ z }, req, res) => {
  const inputValidation = z.object({
    message: z.string(),
  });
  const input = inputValidation.parse(req.body);

  res.json({
    message: input.message,
  });
};

export default handler;
