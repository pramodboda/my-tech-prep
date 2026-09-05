import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import CodeBlock from "./CodeBlock";

export const CustomCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlock);
  },

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: (element) => {
          const language =
            element.getAttribute("data-language") ||
            element
              .querySelector("code")
              ?.className?.match(/language-(\S+)/)?.[1];

          return language || null;
        },

        renderHTML: (attributes) => {
          if (!attributes.language) {
            return {};
          }

          return {
            "data-language": attributes.language,
          };
        },
      },
    };
  },
});
