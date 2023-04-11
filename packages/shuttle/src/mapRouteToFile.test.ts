import { mapRouteToFile } from "./mapRouteToFile";

describe("mapRouteToFile", () => {
  it("should return true when a expected file path containing the matching route exists", () => {
    const fullPath = mapRouteToFile("/todos", "get", ".ts", ["todos/get.ts"]);
    expect(fullPath).toEqual({ params: {}, path: "todos/get.ts" });
  });

  it("should return true when a expected file path containing the matching route exists", () => {
    const fullPath = mapRouteToFile("/todos/123", "get", ".ts", [
      "todos/[id]/get.ts",
      "todos/get.ts",
    ]);
    expect(fullPath).toEqual({
      params: { id: "123" },
      path: "todos/[id]/get.ts",
    });
  });

  it("should allow a user to provide strings containing some special characters in the path params", () => {
    const fullPath = mapRouteToFile("/todos/123-aBc_hello", "get", ".ts", [
      "todos/[id]/get.ts",
    ]);
    expect(fullPath).toEqual({
      params: { id: "123-aBc_hello" },
      path: "todos/[id]/get.ts",
    });
  });

  it("should find the path with a large list of paths", () => {
    const paths = ["todos/get.ts", "todos/post.ts", "status/get.ts"];

    const fullPath = mapRouteToFile("/status", "get", ".ts", paths);
    expect(fullPath).toEqual({
      params: {},
      path: "status/get.ts",
    });
  });
});
