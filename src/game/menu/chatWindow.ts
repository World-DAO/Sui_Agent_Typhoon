export class ChatWindow {
  private chatContainer: HTMLDivElement | null = null;
  private chatInput: HTMLInputElement | null = null;
  private chatHistory: HTMLDivElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private isVisible = false;

  private handleKeydown: (e: KeyboardEvent) => void;
  private handleChatSubmit: (e: KeyboardEvent) => void;

  constructor(private onMessageSubmit: (message: string) => void) {
    this.createElements();
    this.setupEventListeners();
  }

  private createElements() {
    this.chatContainer = document.createElement('div');
    Object.assign(this.chatContainer.style, {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '400px',
      height: '500px',
      backgroundColor: '#1E1B2D',
      border: '4px solid #4EEAFF',
      display: 'none',
      flexDirection: 'column',
      padding: '16px',
      zIndex: '1000',
      clipPath: `polygon(
        0 4px,
        4px 4px,
        4px 0,
        calc(100% - 4px) 0,
        calc(100% - 4px) 4px,
        100% 4px,
        100% calc(100% - 4px),
        calc(100% - 4px) calc(100% - 4px),
        calc(100% - 4px) 100%,
        4px 100%,
        4px calc(100% - 4px),
        0 calc(100% - 4px)
      )`
    });

    this.chatHistory = document.createElement('div');
    Object.assign(this.chatHistory.style, {
      flex: '1',
      overflowY: 'auto',
      marginBottom: '12px',
      padding: '8px',
      scrollbarWidth: 'thin',
      scrollbarColor: '#4EEAFF #1E1B2D'
    });

    this.chatInput = document.createElement('input');
    Object.assign(this.chatInput.style, {
      width: '100%',
      padding: '12px',
      border: '2px solid #4EEAFF',
      backgroundColor: '#2A4C54',
      outline: 'none',
      color: '#4EEAFF',
      fontSize: '14px',
      fontFamily: 'PixelFont, monospace',
      clipPath: `polygon(
        0 4px,
        4px 4px,
        4px 0,
        calc(100% - 4px) 0,
        calc(100% - 4px) 4px,
        100% 4px,
        100% calc(100% - 4px),
        calc(100% - 4px) calc(100% - 4px),
        calc(100% - 4px) 100%,
        4px 100%,
        4px calc(100% - 4px),
        0 calc(100% - 4px)
      )`
    });
    this.chatInput.placeholder = 'Type your message...';

    this.closeButton = document.createElement('button');
    Object.assign(this.closeButton.style, {
      position: 'absolute',
      top: '12px',
      right: '12px',
      width: '28px',
      height: '28px',
      border: '2px solid #4EEAFF',
      backgroundColor: '#2A4C54',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      color: '#4EEAFF',
      transition: 'all 0.2s ease',
      clipPath: `polygon(
        0 4px,
        4px 4px,
        4px 0,
        calc(100% - 4px) 0,
        calc(100% - 4px) 4px,
        100% 4px,
        100% calc(100% - 4px),
        calc(100% - 4px) calc(100% - 4px),
        calc(100% - 4px) 100%,
        4px 100%,
        4px calc(100% - 4px),
        0 calc(100% - 4px)
      )`
    });
    this.closeButton.innerHTML = '×';
    this.closeButton.addEventListener('mouseover', () => {
      this.closeButton!.style.backgroundColor = '#9D5BDE';
    });
    this.closeButton.addEventListener('mouseout', () => {
      this.closeButton!.style.backgroundColor = '#2A4C54';
    });
    this.closeButton.addEventListener('click', () => this.hide());

    this.chatContainer.appendChild(this.chatHistory);
    this.chatContainer.appendChild(this.chatInput);
    this.chatContainer.appendChild(this.closeButton);
    document.body.appendChild(this.chatContainer);
  }

  private setupEventListeners() {
    if (!this.chatInput) return;

    this.handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    };

    this.handleChatSubmit = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && this.chatInput?.value.trim()) {
        const message = this.chatInput.value.trim();
        this.onMessageSubmit(message);
        this.chatInput.value = '';
      }
    };

    this.chatInput.addEventListener('keypress', this.handleChatSubmit);
    document.addEventListener('keydown', this.handleKeydown);
  }

  public show() {
    if (this.chatContainer) {
      this.isVisible = true;
      this.chatContainer.style.display = 'flex';
      this.chatInput?.focus();
    }
  }

  public hide() {
    if (this.chatContainer) {
      this.isVisible = false;
      this.chatContainer.style.display = 'none';
    }
  }

  public addMessage(text: string, sender: 'user' | 'barman') {
    if (!this.chatHistory) return;

    const messageDiv = document.createElement('div');
    Object.assign(messageDiv.style, {
      marginBottom: '8px',
      padding: '12px',
      maxWidth: '80%',
      wordWrap: 'break-word',
      fontSize: '14px',
      fontFamily: 'PixelFont, monospace',
      ...(sender === 'user' 
        ? {
            marginLeft: 'auto',
            backgroundColor: '#2A4C54',
            color: '#4EEAFF',
            border: '2px solid #4EEAFF'
          }
        : {
            backgroundColor: '#1E1B2D',
            color: '#4EEAFF',
            border: '2px solid #4EEAFF'
          }),
      clipPath: `polygon(
        0 4px,
        4px 4px,
        4px 0,
        calc(100% - 4px) 0,
        calc(100% - 4px) 4px,
        100% 4px,
        100% calc(100% - 4px),
        calc(100% - 4px) calc(100% - 4px),
        calc(100% - 4px) 100%,
        4px 100%,
        4px calc(100% - 4px),
        0 calc(100% - 4px)
      )`
    });
    messageDiv.textContent = text;
    this.chatHistory.appendChild(messageDiv);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }

  public destroy() {
    if (this.chatInput) {
      this.chatInput.removeEventListener('keypress', this.handleChatSubmit);
    }
    document.removeEventListener('keydown', this.handleKeydown);
    this.chatContainer?.remove();
    this.chatContainer = null;
    this.chatInput = null;
    this.chatHistory = null;
    this.closeButton?.removeEventListener('click', () => this.hide());
    this.closeButton = null;
  }
} 