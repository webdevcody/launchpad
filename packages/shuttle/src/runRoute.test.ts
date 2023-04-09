import { mapRouteToFile } from "./runRoute";

describe("mapRouteToFile", () => {
  it("should return true when a expected file path containing the matching route exists", () => {
    const fullPath = mapRouteToFile("/todos", "get", ".ts", {
      path: "todos",
      name: "todos",
      type: "directory",
      children: [
        {
          path: "todos/get.ts",
          name: "get.ts",
          type: "file",
          children: [],
        },
      ],
    });
    expect(fullPath).toEqual({ params: {}, path: "todos/get.ts" });
  });

  it("should return true when a expected file path containing the matching route exists", () => {
    const fullPath = mapRouteToFile("/todos/123", "get", ".ts", {
      path: "todos",
      name: "todos",
      type: "directory",
      children: [
        {
          path: "todos/123",
          name: "[id]",
          type: "directory",
          children: [
            {
              path: "todos/[id]/get.ts",
              name: "get.ts",
              type: "file",
              children: [],
            },
          ],
        },
      ],
    });
    expect(fullPath).toEqual({
      params: { id: "123" },
      path: "todos/[id]/get.ts",
    });
  });
});
