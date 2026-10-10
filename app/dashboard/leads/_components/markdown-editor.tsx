"use client";

import {
  BoldItalicUnderlineToggles,
  CreateLink,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { MARKDOWN_CONTENT_CLASS } from "./markdown-styles";

// Editor visual (WYSIWYG): la usuaria ve negrita/listas/links con botones y el valor
// que se guarda sigue siendo markdown plano, que es lo que espera el backend.
export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  tall = false,
}: {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  tall?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background focus-within:border-accent">
      <MDXEditor
        markdown={value}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName={`overflow-y-auto px-3 py-2 ${
          tall ? "min-h-56 max-h-80" : "min-h-28 max-h-56"
        } ${MARKDOWN_CONTENT_CLASS}`}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
                <ListsToggle options={["bullet", "number"]} />
                <CreateLink />
              </>
            ),
          }),
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  );
}
