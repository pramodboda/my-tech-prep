// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Placeholder from "@tiptap/extension-placeholder";

// import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
// import css from "highlight.js/lib/languages/css";
// import js from "highlight.js/lib/languages/javascript";
// import ts from "highlight.js/lib/languages/typescript";
// import html from "highlight.js/lib/languages/xml";

// import { all, createLowlight } from "lowlight";

// import { useEffect } from "react";

// // create a lowlight instance with all languages loaded
// const lowlight = createLowlight(all);

// // This is only an example, all supported languages are already loaded above
// // but you can also register only specific languages to reduce bundle-size
// lowlight.register("html", html);
// lowlight.register("css", css);
// lowlight.register("javascript", js);
// lowlight.register("ts", ts);

// interface Props {
//   content: string;
//   onChange: (html: string) => void;
//   placeholder?: string;
//   mode: "deep" | "short";
// }

// export default function RichEditor({
//   content,
//   onChange,
//   placeholder,
//   mode,
// }: Props) {
//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Placeholder.configure({ placeholder: placeholder || "Start typing…" }),
//       CodeBlockLowlight.configure({
//         lowlight,
//         languageClassPrefix: "language-",
//       }),
//     ],
//     content: content || "",
//     onUpdate: ({ editor }) => onChange(editor.getHTML()),
//   });

//   useEffect(() => {
//     if (editor && content !== editor.getHTML()) {
//       const { from, to } = editor.state.selection;
//       editor.commands.setContent(content || "", { emitUpdate: false });
//       editor.commands.setTextSelection({ from, to });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [content]);

//   if (!editor) return null;

//   return (
//     <div className={mode === "deep" ? "editor-deep" : "editor-short"}>
//       <EditorContent editor={editor} />
//     </div>
//   );
// }

import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { createLowlight, common } from "lowlight";

import { useEffect } from "react";

import { CustomCodeBlock } from "./editor/CustomCodeBlock";

const lowlight = createLowlight(common);

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  mode: "deep" | "short";
}

export default function RichEditor({
  content,
  onChange,
  placeholder,
  mode,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),

      Placeholder.configure({
        placeholder: placeholder || "Start typing…",
      }),

      CustomCodeBlock.configure({
        lowlight,
      }),
    ],

    content: content || "",

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (content !== editor.getHTML()) {
      const { from, to } = editor.state.selection;

      editor.commands.setContent(content || "", {
        emitUpdate: false,
      });

      try {
        editor.commands.setTextSelection({
          from,
          to,
        });
      } catch {
        // Ignore invalid selection after content replacement
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;

    const updateCodeBlockSpellcheck = () => {
      editor.view.dom.querySelectorAll("pre").forEach((element) => {
        element.setAttribute("spellcheck", "false");
      });
    };

    updateCodeBlockSpellcheck();

    editor.on("transaction", updateCodeBlockSpellcheck);

    return () => {
      editor.off("transaction", updateCodeBlockSpellcheck);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={mode === "deep" ? "editor-deep" : "editor-short"}>
      <EditorContent editor={editor} />
    </div>
  );
}
