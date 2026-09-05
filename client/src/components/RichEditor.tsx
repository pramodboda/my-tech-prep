import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  mode: "deep" | "short";
}

export default function RichEditor({ content, onChange, placeholder, mode }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: placeholder || "Start typing…" })],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(content || "", { emitUpdate: false });
      editor.commands.setTextSelection({ from, to });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  return (
    <div className={mode === "deep" ? "editor-deep" : "editor-short"}>
      <EditorContent editor={editor} />
    </div>
  );
}
