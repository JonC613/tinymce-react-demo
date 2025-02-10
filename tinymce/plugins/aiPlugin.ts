import OpenAI from 'openai';

// Validate that the API key is provided
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key in environment variables');
}

// Initialize the OpenAI client (be cautious when exposing API keys in the browser)
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Define a custom SVG icon (adjust as needed)
const customIconSVG = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  role="img"
  aria-labelledby="titleID descID"
>
  <title id="titleID">Magic Wand AI Icon</title>
  <desc id="descID">
    An icon featuring a stylized magic wand with a sparkling tip and the letters "AI" next to it.
  </desc>
  <!-- Wand Group: Positioned on the left side with a -45° rotation -->
  <g transform="translate(3,12) rotate(-45)">
    <!-- Wand handle: a rounded rectangle -->
    <rect x="0" y="-1" width="10" height="2" rx="1" fill="#6C63FF" />
    <!-- Star spark at the wand’s tip -->
    <polygon
      fill="#FFD700"
      stroke="#DAA520"
      stroke-width="0.2"
      transform="translate(10,0)"
      points="0,-2 0.6,-0.8 2,-0.8 0.95,0.3 1.54,2 0,1 -1.54,2 -0.95,0.3 -2,-0.8 -0.6,-0.8"
    />
  </g>
  <!-- "AI" Text: Positioned directly to the right of the wand -->
  <text
    x="13"
    y="12"
    font-family="Arial, sans-serif"
    font-size="8"
    font-weight="bold"
    fill="#333"
    dominant-baseline="middle"
  >
    AI
  </text>
</svg>

`;

// TypeScript interfaces for menu items
interface MenuItem {
  type: 'menuitem';
  text: string;
  onAction: () => void;
  disabled?: boolean;
}

interface NestedMenuItem {
  type: 'nestedmenuitem';
  text: string;
  getSubmenuItems: () => MenuItem[];
}

interface AIPlugin {
  (editor: any): void;
}

/**
 * Calls the OpenAI API to transform the provided text.
 * @param text The text to transform.
 * @param tone The tone to apply.
 * @returns A promise resolving to the transformed text or an error message.
 */
const transformText = async (text: string, tone: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Adjust model as needed.
      messages: [
        {
          role: 'system',
          content: 'You are a writing assistant'
        },
        {
          role: 'user',
          content: `Transform the following text to have a ${tone}. Ensure the length roughly matches that of the original message.  tone: ${text}`
        },
      ],
      store: true,
    });
    const content = response.choices[0]?.message?.content?.trim();
    return content ?? 'Error: No content returned';
  } catch (error) {
    console.error('Error transforming text:', error);
    return 'Error transforming text';
  }
};

/**
 * Opens a dialog that displays the transformed text and allows the user to insert it.
 * @param editor The TinyMCE editor instance.
 * @param transformedText The text to show in the dialog.
 */
const showDialog = (editor: any, transformedText: string) => {
  editor.windowManager.open({
    title: 'Transformed Text',
    initialData: { transformedText },
    body: {
      type: 'panel',
      items: [
        {
          type: 'textarea',
          name: 'transformedText',
          label: 'Transformed Text',
          multiline: true,
          minHeight: 200,
        },
      ],
    },
    buttons: [
      { type: 'submit', text: 'Accept', primary: true },
      { type: 'cancel', text: 'Cancel' },
    ],
    onSubmit: (api: any) => {
      const data = api.getData();
      editor.insertContent(`<p>${data.transformedText}</p>`);
      api.close();
    },
  });
};

/**
 * The TinyMCE AI plugin.
 * It registers a custom menu button that offers various text transformation options.
 */
const AIPlugin: AIPlugin = (editor) => {
  // Register the custom icon.
  editor.ui.registry.addIcon('customIcon', customIconSVG);

  // Register the menu button.
  editor.ui.registry.addMenuButton('customMenuButton', {
    icon: 'customIcon',
    tooltip: 'AI Text Transformation',
    fetch: async (callback: (items: (MenuItem | NestedMenuItem)[]) => void) => {
      const selectedText = editor.selection.getContent({ format: 'text' });

      // If no text is selected, show a single disabled (dithered) menu item.
      if (!selectedText || selectedText.trim().length === 0) {
        callback([
          {
            type: 'menuitem',
            text: 'No text selected. Please select some text.',
            onAction: () => {
              editor.notificationManager.open({
                text: 'Please select some text in the editor before using the AI transformation.',
                type: 'info',
              });
            },
            disabled: true,
          },
        ]);
        return;
      }

      // Helper function to perform text transformation.
      const handleTextTransformation = async (tone: string) => {
        const result = await transformText(selectedText, tone);
        if (result.startsWith('Error')) {
          editor.notificationManager.open({
            text: result,
            type: 'error',
          });
        } else {
          showDialog(editor, result);
        }
      };

      // Define the menu structure when text is selected.
      const items: (MenuItem | NestedMenuItem)[] = [
        {
          type: 'nestedmenuitem',
          text: 'Message Tone',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Happy', onAction: () => handleTextTransformation('happy') },
            { type: 'menuitem', text: 'Stern', onAction: () => handleTextTransformation('stern') },
          ],
        },
        {
          type: 'nestedmenuitem',
          text: 'Message Sentiment',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Business', onAction: () => handleTextTransformation('business') },
            { type: 'menuitem', text: 'Legal', onAction: () => handleTextTransformation('legal') },
          ],
        },
        {
          type: 'nestedmenuitem',
          text: 'Language',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Spanish', onAction: () => handleTextTransformation('Spanish') },
            { type: 'menuitem', text: 'French', onAction: () => handleTextTransformation('French') },
          ],
        },
      ];
      callback(items);
    },
  });
};

export default AIPlugin;
