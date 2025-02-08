import OpenAI from 'openai';

// Log that the AI Plugin is loading
console.log('Loading AI Plugin...');

// Check if the OpenAI API Key is present in environment variables
if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key in environment variables');
}

// Log the OpenAI API Key (for debugging purposes)
console.log('OpenAI API Key:', import.meta.env.VITE_OPENAI_API_KEY);

// Initialize the OpenAI client with the API Key
const openai = new OpenAI(
  { apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true }
);

// Define the custom SVG icon for the plugin
const customIconSVG =
  '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<text x="2" y="20" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#000">AI</text>' +
    '<line x1="16" y1="8" x2="22" y2="2" stroke="#000" stroke-width="2" stroke-linecap="round"/>' +
    '<polygon fill="#FFD700" points="22,1 22.29,1.60 22.95,1.69 22.48,2.15 22.59,2.81 22,2.5 21.41,2.81 21.52,2.15 21.05,1.69 21.71,1.60"/>' +
  '</svg>';

// Define the MenuItem interface
interface MenuItem {
  type: 'menuitem';
  text: string;
  onAction: () => void;
  disabled?: boolean;
}

// Define the NestedMenuItem interface
interface NestedMenuItem {
  type: 'nestedmenuitem';
  text: string;
  getSubmenuItems: () => MenuItem[];
}

// Define the AIPlugin interface
interface AIPlugin {
  (editor: any): void;
}

// Function to transform text using OpenAI API
const transformText = async (text: string, tone: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Transform the following text to have a ${tone} tone: ${text}` },
      ],
      store: true,
    });
    const content = response.choices[0]?.message?.content?.trim();
    console.log('Transformed text:', content); // Debugging log
    return content ?? 'Error: No content returned';
  } catch (error) {
    console.error('Error transforming text:', error);
    return 'Error transforming text';
  }
};

// Function to show the dialog with transformed text
const showDialog = (editor: any, transformedText: string) => {
  console.log('Opening dialog with transformed text:', transformedText); // Debugging log

  editor.windowManager.open({
    title: 'Transformed Text',
    // Pass the initial value via initialData
    initialData: {
      transformedText: transformedText,
    },
    body: {
      type: 'panel',
      items: [
        {
          type: 'textarea',
          name: 'transformedText',
          label: 'Transformed Text',
          multiline: true,
          minHeight: 200
        }
      ]
    },
    buttons: [
      {
        type: 'submit',
        text: 'Accept',
        primary: true
      },
      {
        type: 'cancel',
        text: 'Reject'
      },
      {
        type: 'custom',
        text: 'Reword',
        name: 'reword'
      }
    ],
    onSubmit: (api: any) => {
      const data = api.getData();
      // Insert the transformed text into the editor content
      editor.insertContent(`<p>${data.transformedText}</p>`);
      api.close();
    },
    onAction: (api: any, details: any) => {
      if (details.name === 'reword') {
        // Handle the "Reword" action as needed
      }
    }
  });
};


// Define the AIPlugin function
const AIPlugin: AIPlugin = (editor) => {
  // Add a custom menu button to the editor
  editor.ui.registry.addMenuButton('customMenuButton', {
    icon: 'customIcon',
    fetch: async (callback: (items: (MenuItem | NestedMenuItem)[]) => void) => {
      // Get the selected text from the editor
      const selectedText = editor.selection.getContent({ format: 'text' });
      console.log('Selected text:', selectedText); // Debugging log
      const isDisabled = !selectedText;

      // Define the menu items
      const items: (MenuItem | NestedMenuItem)[] = [
        {
          type: 'nestedmenuitem',
          text: 'Message Tone',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Happy', onAction: async () => {
              const transformedText = await transformText(selectedText, 'happy');
              showDialog(editor, transformedText);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'Stern', onAction: async () => {
              const transformedText = await transformText(selectedText, 'stern');
              showDialog(editor, transformedText);
            }, disabled: isDisabled }
          ]
        },
        {
          type: 'nestedmenuitem',
          text: 'Message Sentiment',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Business', onAction: async () => {
              const transformedText = await transformText(selectedText, 'business');
              showDialog(editor, transformedText);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'Legal', onAction: async () => {
              const transformedText = await transformText(selectedText, 'legal');
              showDialog(editor, transformedText);
            }, disabled: isDisabled }
          ]
        },
        {
          type: 'nestedmenuitem',
          text: 'Language',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Spanish', onAction: async () => {
              const transformedText = await transformText(selectedText, 'Spanish');
              showDialog(editor, transformedText);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'French', onAction: async () => {
              const transformedText = await transformText(selectedText, 'French');
              showDialog(editor, transformedText);
            }, disabled: isDisabled }
          ]
        }
      ];
      callback(items);
    }
  });

  // Add the custom icon to the editor
  editor.ui.registry.addIcon('customIcon', customIconSVG);
};

// Export the AIPlugin as the default export
export default AIPlugin;