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
    fetch: (callback: (items: (MenuItem | NestedMenuItem)[]) => void) => {
      const selectedText = editor.selection.getContent({ format: 'text' });
      const isDisabled = !selectedText;

      const items: (MenuItem | NestedMenuItem)[] = [
        {
          type: 'nestedmenuitem',
          text: 'Message Tone',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Happy', onAction: () => {
              editor.insertContent(`<p>${selectedText} Happy</p>`);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'Stern', onAction: () => {
              editor.insertContent(`<p>${selectedText} Stern</p>`);
            }, disabled: isDisabled }
          ]
        },
        {
          type: 'nestedmenuitem',
          text: 'Message Sentiment',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Business', onAction: () => {
              editor.insertContent(`<p>${selectedText} Business</p>`);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'Legal', onAction: () => {
              editor.insertContent(`<p>${selectedText} Legal</p>`);
            }, disabled: isDisabled }
          ]
        },
        {
          type: 'nestedmenuitem',
          text: 'Language',
          getSubmenuItems: () => [
            { type: 'menuitem', text: 'Spanish', onAction: () => {
              editor.insertContent(`<p>${selectedText} Spanish</p>`);
            }, disabled: isDisabled },
            { type: 'menuitem', text: 'French', onAction: () => {
              editor.insertContent(`<p>${selectedText} French</p>`);
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