import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './App.css';

export default function App() {
  const editorRef = useRef<any>(null); // Use 'any' to access TinyMCE editor API
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  interface MenuItem {
    type: 'menuitem';
    text: string;
    onAction: () => void;
  }

  interface NestedMenuItem {
    type: 'nestedmenuitem';
    text: string;
    getSubmenuItems: () => MenuItem[];
  }

  interface CustomPlugin {
    (editor: any): void;
  }

  const customPlugin: CustomPlugin = (editor) => {
    editor.ui.registry.addMenuButton('customMenuButton', {
      text: 'Custom Menu',
      fetch: (callback: (items: (MenuItem | NestedMenuItem)[]) => void) => {
        const items: (MenuItem | NestedMenuItem)[] = [
          {
            type: 'nestedmenuitem',
            text: 'Submenu 1',
            getSubmenuItems: () => [
              { type: 'menuitem', text: 'Item 1', onAction: () => editor.insertContent('<p>Item 1</p>') },
              { type: 'menuitem', text: 'Item 2', onAction: () => editor.insertContent('<p>Item 2</p>') }
            ]
          },
          {
            type: 'nestedmenuitem',
            text: 'Submenu 2',
            getSubmenuItems: () => [
              { type: 'menuitem', text: 'Item 3', onAction: () => editor.insertContent('<p>Item 3</p>') },
              { type: 'menuitem', text: 'Item 4', onAction: () => editor.insertContent('<p>Item 4</p>') }
            ]
          }
        ];
        callback(items);
      }
    });
  };

  return (
    <>
      <Editor
        tinymceScriptSrc='/tinymce/tinymce.min.js'
        licenseKey='your-license-key'
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          customPlugin(editor); // Initialize custom plugin
        }}
        initialValue='<p>This is the initial content of the editor.</p>'
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
            'emoticons' // Added emoticons plugin
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | emoticons | customMenuButton | help', // Added customMenuButton to toolbar
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />
      <button onClick={log}>Log editor content</button>
    </>
  );
}