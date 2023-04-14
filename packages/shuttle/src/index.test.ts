import shuttle from "./index";

jest.mock("envalid", () => ({
  ...jest.requireActual("envalid"),
  cleanEnv: () => ({
    IS_LAMBDA: true,
  }),
}));

describe("index", () => {
  it("should correctly parse testQueryParms from request and return it in the handler which veries query string params are being passed around correctly", async () => {
    const { createHandler } = shuttle({
      providers: {},
    });
    const handler = createHandler({
      input: (z) => {
        return z.object({
          testQueryParam: z.string(),
        });
      },
      handler: async ({ input }) => {
        return input.testQueryParam;
      },
    });
    const mockReq = {
      query: {
        testQueryParam: "hello world",
      },
    };
    const mockRes = {
      json: jest.fn(),
    };
    await handler({} as any, {}, mockReq as any, mockRes as any);
    expect(mockRes.json).toBeCalledWith("hello world");
  });

  it("should have access to the setup providers inside the handler", async () => {
    const expectedMessage = "this is a message";
    const { createHandler } = shuttle({
      providers: {
        getMessage() {
          return expectedMessage;
        },
      },
    });
    const handler = createHandler({
      handler: async ({ providers }) => {
        return providers.getMessage();
      },
    });
    const mockReq = {
      query: {},
    };
    const mockRes = {
      json: jest.fn(),
    };
    await handler({} as any, {}, mockReq as any, mockRes as any);
    expect(mockRes.json).toBeCalledWith(expectedMessage);
  });
});
