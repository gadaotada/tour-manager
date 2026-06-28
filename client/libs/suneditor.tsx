import { useEffect, useRef } from "react";
import suneditor from "suneditor";
import {
  align, font, fontColor, fontSize, image, lineHeight, link, list, table
} from "suneditor/plugins";
import "suneditor/css/editor";
import "suneditor/css/contents";
import 'suneditor/src/themes/dark.css';

import { useCurrentTheme } from "./theme";
import type Editor from "suneditor/src/core/editor.js";

function useSunEditorDraft(initialValue: string) {
  const contentRef = useRef(initialValue);

  const getValue = () => contentRef.current;

  const handleChange = ({ data }: { data: string }) => {
    contentRef.current = data;
  };

  return { getValue, handleChange };
}

export default function SunEditor() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const theme = useCurrentTheme();
  const draft = useSunEditorDraft("<p>Hello SunEditor</p>")

  useEffect(() => {
    if (!ref.current || editorRef.current) return;

    const instance = suneditor.create(ref.current, {
      plugins: {
        align, font, fontColor, fontSize, image, lineHeight, link, list, table
      },
      theme: theme,
      value: draft.getValue(),
      events: {
        onChange: draft.handleChange
      },
      buttonList: [
        ['undo', 'redo', 'font', 'fontSize'],
        "|",
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript', 'removeFormat'],
        "|",
        ['fontColor', 'outdent', 'indent', 'align', 'list', 'link'],
        "|",
        ['image', 'fullScreen', 'showBlocks', 'codeView', 'preview', 'lineHeight', 'print', 'table', 'save']
      ]
    });

    editorRef.current = instance;

    return () => {
      instance.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.$.ui.setTheme(theme);
  }, [theme]);

  return <textarea ref={ref} />;
}
