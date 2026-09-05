import { IoCopyOutline } from "react-icons/io5";

import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useState } from "react";

interface CodeBlockProps {
  node: {
    attrs: {
      language: string | null;
    };
    textContent: string;
  };

  updateAttributes: (attributes: Record<string, unknown>) => void;
}

const languages = [
  { label: "Auto", value: "" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "JSX", value: "jsx" },
  { label: "TSX", value: "tsx" },
  { label: "HTML", value: "xml" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "SQL", value: "sql" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Bash", value: "bash" },
  { label: "Markdown", value: "markdown" },
];

export default function CodeBlock({ node, updateAttributes }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const language = node.attrs.language || "";

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    updateAttributes({
      language: event.target.value || null,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <NodeViewWrapper className="custom-code-block">
      <div className="code-block-header">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="code-language-select"
          contentEditable={false}
        >
          {languages.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleCopy}
          className="code-copy-button"
          contentEditable={false}
        >
          {copied ? "✓ Copied" : <IoCopyOutline />}
        </button>
      </div>

      <pre className={`language-${language || "text"}`}>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
