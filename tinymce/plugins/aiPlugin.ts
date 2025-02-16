import OpenAI from 'openai';
import { ignoreOverride } from 'openai/_vendor/zod-to-json-schema/Options.mjs';

// Types and Interfaces
interface ImportMetaEnv {
  VITE_OPENAI_API_KEY: string;
  env: any;
  
}

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

// Constants
//@ts-ignore
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key in environment variables');
}

const customIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <g transform="translate(3,12) rotate(-45)">
    <rect x="0" y="-1" width="10" height="2" rx="1" fill="#6C63FF" />
    <polygon fill="#FFD700" stroke="#DAA520" stroke-width="0.2" transform="translate(10,0)" 
      points="0,-2 0.6,-0.8 2,-0.8 0.95,0.3 1.54,2 0,1 -1.54,2 -0.95,0.3 -2,-0.8 -0.6,-0.8"/>
  </g>
  <text x="13" y="12" font-family="Arial" font-size="8" font-weight="bold" fill="#333">AI</text>
</svg>`;

const MENU_ITEMS = {
  tone: [
    { text: 'Professional', prompt: 'Rewrite this content using polished, formal, and respectful language to convey professional expertise and competence.' },
    { text: 'Casual', prompt: 'Rewrite this content with casual, informal language to convey a casual conversation with a real person.' },
    { text: 'Direct', prompt: 'Rewrite this content with direct language using only the essential information.' },
    { text: 'Confident', prompt: 'Rewrite this content using compelling, optimistic language to convey confidence in the writing.' },
    { text: 'Friendly', prompt: 'Rewrite this content using friendly, comforting language, to convey understanding and empathy.' },
  ],
  style: [
    { text: 'Business', prompt: 'Rewrite this content as a business professional with formal language.' },
    { text: 'Legal', prompt: 'Rewrite this content as a legal professional using valid legal terminology.' },
    { text: 'Itemized', prompt: 'Rewrite this content with a clear, structured breakdown of information, organizing details in a systematic way.' },
    { text: 'Concise', prompt: 'Rewrite this content in a brief, precise manner that focuses on essential details and clear communication.' },
    { text: 'Reminder', prompt: 'Rewrite this content as a gentle reminder, using courteous language to prompt action while maintaining professionalism.' },
  ],
  translate: [
    { text: 'English', prompt: 'Translate this content into English, maintaining the original tone and style.' },
    { text: 'French', prompt: 'Translate this content into French, maintaining the original tone and style.' },
    { text: 'Spanish', prompt: 'Translate this content into Spanish, maintaining the original tone and style.' },
  ],
};

// OpenAI Service
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const transformText = async (text: string, prompt: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a writing assistant' },
        { role: 'user', content: `${prompt}: ${text}` },
      ],
      store: true,
    });
    
    const content = response.choices[0]?.message?.content?.trim()
      ?.replace(/^[^:]*:\s*/, '') ?? 'Error: No content returned';
    return content;
  } catch (error) {
    console.error('Error transforming text:', error);
    return 'Error transforming text';
  }
};

// UI Components
const showDialog = (editor: any, transformedText: string): void => {
  editor.windowManager.open({
    title: 'Transformed Text',
    initialData: { transformedText },
    body: {
      type: 'panel',
      items: [{
        type: 'textarea',
        name: 'transformedText',
        label: 'Transformed Text',
        multiline: true,
        minHeight: 200,
      }],
    },
    buttons: [
      { type: 'submit', text: 'Accept', primary: true },
      { type: 'cancel', text: 'Cancel' },
    ],
    onSubmit: (api: any) => {
      editor.insertContent(`<p>${api.getData().transformedText}</p>`);
      api.close();
    },
  });
};

// Menu Creation Helper
const createSubmenuItems = (items: typeof MENU_ITEMS.tone, handleTransform: (prompt: string) => void): MenuItem[] => {
  return items.map(({ text, prompt }) => ({
    type: 'menuitem',
    text,
    onAction: () => handleTransform(prompt),
  }));
};

// Main Plugin
const AIPlugin: AIPlugin = (editor) => {
  editor.ui.registry.addIcon('customIcon', customIconSVG);

  editor.ui.registry.addMenuButton('customMenuButton', {
    icon: 'customIcon',
    tooltip: 'AI Text Transformation',
    fetch: async (callback: (items: (MenuItem | NestedMenuItem)[]) => void) => {
      const selectedText = editor.selection.getContent({ format: 'text' });

      if (!selectedText?.trim()) {
        callback([{
          type: 'menuitem',
          text: 'No text selected. Please select some text.',
          onAction: () => {
            editor.notificationManager.open({
              text: 'Please select some text in the editor before using the AI transformation.',
              type: 'info',
            });
          },
          disabled: true,
        }]);
        return;
      }

      const handleTextTransformation = async (prompt: string) => {
        console.log(`Transforming text with prompt: ${prompt}`);
        const result = await transformText(selectedText, prompt);
        
        if (result.startsWith('Error')) {
          editor.notificationManager.open({
            text: result,
            type: 'error',
          });
          return;
        }
        
        showDialog(editor, result);
      };

      const menuItems: (MenuItem | NestedMenuItem)[] = [
        {
          type: 'nestedmenuitem',
          text: 'Change tone',
          getSubmenuItems: () => createSubmenuItems(MENU_ITEMS.tone, handleTextTransformation),
        },
        {
          type: 'nestedmenuitem',
          text: 'Change style',
          getSubmenuItems: () => createSubmenuItems(MENU_ITEMS.style, handleTextTransformation),
        },
        {
          type: 'nestedmenuitem',
          text: 'Translate',
          getSubmenuItems: () => createSubmenuItems(MENU_ITEMS.translate, handleTextTransformation),
        },
      ];

      callback(menuItems);
    },
  });
};

export default AIPlugin;
