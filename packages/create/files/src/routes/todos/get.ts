import { ExampleKey, ShuttleHandler } from "../..";

const handler: ShuttleHandler = async ({ inject, logger }, req, res) => {
  logger.info("getting todos");
  const message = inject(ExampleKey);
  res.json([
    {
      message,
    },
  ]);
};

export default handler;
