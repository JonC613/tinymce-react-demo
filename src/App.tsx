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

  const customIconSVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<text x="2" y="20" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#000">AI</text>' +
    '<line x1="16" y1="8" x2="22" y2="2" stroke="#000" stroke-width="2" stroke-linecap="round"/>' +
    '<polygon fill="#FFD700" points="22,1 22.29,1.60 22.95,1.69 22.48,2.15 22.59,2.81 22,2.5 21.41,2.81 21.52,2.15 21.05,1.69 21.71,1.60"/>' +
  '</svg>';

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
      icon: 'customIcon',
      fetch: (callback: (items: (MenuItem | NestedMenuItem)[]) => void) => {
        const items: (MenuItem | NestedMenuItem)[] = [
          {
            type: 'nestedmenuitem',
            text: 'Message Tone',
            getSubmenuItems: () => [
              { type: 'menuitem', text: 'Happy', onAction: () => editor.insertContent('<p>Item 1</p>') },
              { type: 'menuitem', text: 'Stern', onAction: () => editor.insertContent('<p>Item 2</p>') }
            ]
          },
          {
            type: 'nestedmenuitem',
            text: 'Message Sentiment',
            getSubmenuItems: () => [
              { type: 'menuitem', text: 'Business', onAction: () => editor.insertContent('<p>Item 3</p>') },
              { type: 'menuitem', text: 'Legal', onAction: () => editor.insertContent('<p>Item 4</p>') }
            ]
          },
          {
            type: 'nestedmenuitem',
            text: 'Language',
            getSubmenuItems: () => [
              { type: 'menuitem', text: 'Spanish', onAction: () => editor.insertContent('<p>Item 3</p>') },
              { type: 'menuitem', text: 'French', onAction: () => editor.insertContent('<p>Item 4</p>') }
            ]
          }
        ];
        callback(items);
      }
    });
    editor.ui.registry.addIcon('customIcon', customIconSVG);
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