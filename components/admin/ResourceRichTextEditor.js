"use client";

import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Redo2,
  Table as TableIcon,
  Undo2,
} from "lucide-react";

function ToolbarButton({ onClick, isActive = false, icon: Icon, label, title, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-pressed={isActive}
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label ? <span>{label}</span> : null}
    </button>
  );
}

function ToolbarGroup({ children }) {
  return <div className="flex items-center gap-1">{children}</div>;
}

function ToolbarDivider() {
  return <span className="mx-1 hidden h-6 w-px bg-neutral-200 sm:block" />;
}

export default function ResourceRichTextEditor({ name = "content_html", initialContent = "" }) {
  const sanitizedInitial = initialContent?.trim() ? initialContent : "<p></p>";
  const [htmlValue, setHtmlValue] = useState(sanitizedInitial);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({ levels: [2, 3, 4] }),
      Image.configure({ inline: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Start writing your article…" }),
    ],
    content: sanitizedInitial,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none prose-headings:font-serif prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setHtmlValue(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return undefined;
    return () => editor.destroy();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const handleSetLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Link URL", previousUrl);
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed, target: "_blank", rel: "noopener noreferrer" })
      .run();
  }, [editor]);

  const handleUnsetLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-500">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={htmlValue} readOnly />
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 shadow-sm">
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={Bold}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={Italic}
            title="Italic"
          />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          {[2, 3, 4].map((level) => (
            <ToolbarButton
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              isActive={editor.isActive("heading", { level })}
              label={`H${level}`}
              title={`Heading ${level}`}
              icon={level === 2 ? Heading2 : level === 3 ? Heading3 : Heading4}
            />
          ))}
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={List}
            title="Bulleted list"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={ListOrdered}
            title="Numbered list"
          />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <ToolbarButton onClick={handleSetLink} icon={Link2} isActive={editor.isActive("link")} title="Add link" />
          <ToolbarButton onClick={handleUnsetLink} icon={Link2Off} title="Remove link" />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <ToolbarButton onClick={addImage} icon={ImageIcon} title="Insert image" />
          <ToolbarButton onClick={insertTable} icon={TableIcon} title="Insert table" />
          <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} label="Col +" title="Add column" />
          <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} label="Col -" title="Delete column" />
          <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} label="Row +" title="Add row" />
          <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} label="Row -" title="Delete row" />
          <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} label="Clear" title="Remove table" />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo2} title="Undo" />
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo2} title="Redo" />
        </ToolbarGroup>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .ProseMirror {
          min-height: 320px;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #d4d4d8;
          padding: 0.5rem;
        }
        .ProseMirror ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin: 0.5rem 0;
        }
        .ProseMirror ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror li + li {
          margin-top: 0.25rem;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
}
