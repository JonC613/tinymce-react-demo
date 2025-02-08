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
//
const AIPlugin: AIPlugin = (editor) => {
  editor.ui.registry.addMenuButton('customMenuButton', {
    icon: 'customIcon',
    fetch: async (callback: (items: (MenuItem | NestedMenuItem)[]) => void) => {
      const selectedText = editor.selection.getContent({ format: 'text' });
      console.log(selectedText);
      const isDisabled = !selectedText;

      const transformText = async (text: string, tone: string) => {
        const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `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`
          },
          body: JSON.stringify({
            prompt: `Transform the following text to have a ${tone} tone: ${text}`,
            max_tokens: 60
          })
        });
        const data = await response.json();
        return data.choices[0].text.trim();
      };

      const items: (MenuItem | NestedMenuItem)[] = [
        {
          type: 'nestedmenuitem',
          text: 'Message Tone',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Happy', onAction: async () => {
              const transformedText = await transformText(selectedText, 'happy');
              editor.insertContent(`<p>${transformedText}</p>`);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'Stern', onAction: async () => {
              const transformedText = await transformText(selectedText, 'stern');
              editor.insertContent(`<p>${transformedText}</p>`);
            }, disabled: isDisabled }
          ]
        },
        {
          type: 'nestedmenuitem',
          text: 'Message Sentiment',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Business', onAction: async () => {
              const transformedText = await transformText(selectedText, 'business');
              editor.insertContent(`<p>${transformedText}</p>`);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'Legal', onAction: async () => {
              const transformedText = await transformText(selectedText, 'legal');
              editor.insertContent(`<p>${transformedText}</p>`);
            }, disabled: isDisabled }
          ]
        },
        {
          type: 'nestedmenuitem',
          text: 'Language',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Spanish', onAction: async () => {
              const transformedText = await transformText(selectedText, 'Spanish');
              editor.insertContent(`<p>${transformedText}</p>`);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'French', onAction: async () => {
              const transformedText = await transformText(selectedText, 'French');
              editor.insertContent(`<p>${transformedText}</p>`);
            }, disabled: isDisabled }
          ]
        }
      ];
      callback(items);
    }
  });

  editor.ui.registry.addIcon('customIcon', customIconSVG);
};

export default AIPlugin;