import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './App.css';
import customPlugin from '../public/tinymce/plugins/aiPlugin.ts'; // Import custom plugin

export default function App() {
  const editorRef = useRef<any>(null); // Use 'any' to access TinyMCE editor API
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
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