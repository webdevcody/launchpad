const fs = require("fs");

export type Node = {
  path: string;
  name: string;
  type: string;
  children: Node[];
};

export function getDirectoryTree(directoryPath: string) {
  const stats = fs.statSync(directoryPath);
  if (!stats.isDirectory()) {
    return null;
  }

  const tree: Node = {
    path: directoryPath,
    name: getNameFromPath(directoryPath),
    type: "directory",
    children: [],
  };

  const contents = fs.readdirSync(directoryPath);
  contents.forEach((item: string) => {
    const itemPath = `${directoryPath}/${item}`;
    const itemStats = fs.statSync(itemPath);
    if (itemStats.isDirectory()) {
      const childTree = getDirectoryTree(itemPath);
      if (childTree !== null) {
        tree.children.push(childTree);
      }
    } else {
      tree.children.push({
        path: itemPath,
        name: item,
        type: "file",
        children: [],
      });
    }
  });

  return tree;
}

function getNameFromPath(filePath: string) {
  const parts = filePath.split("/");
  return parts[parts.length - 1];
}
