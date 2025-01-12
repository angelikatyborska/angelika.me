import { type RehypePlugin } from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";

const rehypeWrapTables: RehypePlugin = () => {
  return function plugin(ast, _, done) {
    visit(ast, (node, i, parent) => {
      if (node.type === "element" && node.tagName === "table" && typeof i === "number") {
        const copy = Object.assign({}, node);

        node = {
          // @ts-expect-error: 'mdxJsxFlowElement' seems to be a custom type not allowed by RehypePlugin?
          type: "mdxJsxFlowElement",
          name: "div",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "className",
              value: "table-wrapper",
            },
          ],
          children: [copy],
          data: { _mdxExplicitJsx: true },
          position: copy.position,
        };

        if (parent) {
          // @ts-expect-error: expects tagName but 'mdxJsxFlowElement' don't have it
          parent.children[i] = node;
        }
      }
    });

    done();
    return ast;
  };
};

export default rehypeWrapTables;
