import { EventBus } from '../EventBus';

export class ChatWindow {
  private chatContainer: HTMLDivElement | null = null;
  private chatInput: HTMLInputElement | null = null;
  private chatHistory: HTMLDivElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private resizeButton: HTMLButtonElement | null = null;
  private isVisible = false;
  private isEnlarged = false;  // Track window size state

  private handleKeydown: (e: KeyboardEvent) => void;
  private handleChatSubmit: (e: KeyboardEvent) => void;
  private handleSpaceKey: (e: KeyboardEvent) => void;

  private accumulatedText = '';

  constructor(private onMessageSubmit: (message: string) => void) {
    this.createElements();
    this.setupEventListeners();

    // Add keyframe animation to head
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
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

    // Update resize button creation
    this.resizeButton = document.createElement('button');
    Object.assign(this.resizeButton.style, {
      position: 'absolute',
      top: '12px',
      right: '48px',
      width: '28px',
      height: '28px',
      backgroundColor: '#2A4C54',
      border: '2px solid #4EEAFF',
      color: '#4EEAFF',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
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

    // Use the stored reference
    this.resizeButton.addEventListener('click', () => this.toggleSize());
    
    this.chatContainer.appendChild(this.resizeButton);
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
        console.log("📤 Submitting message:", message);
        this.onMessageSubmit(message);
        this.chatInput.value = '';
      }
    };

    this.chatInput.addEventListener('keypress', this.handleChatSubmit);
    document.addEventListener('keydown', this.handleKeydown);

    this.handleSpaceKey = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault();
        const input = event.target as HTMLTextAreaElement;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const value = input.value;
        const newValue = value.substring(0, start) + ' ' + value.substring(end);
        
        input.value = newValue;
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = start + 1;
        }, 0);
      }
    };

    this.chatInput.addEventListener('keydown', this.handleSpaceKey);
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

  public async addMessage(text: string, sender: 'user' | 'barman') {
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
                border: '1px solid rgba(78, 234, 255, 0.3)'
            }
            : {
                backgroundColor: '#1E1B2D',
                color: '#4EEAFF',
            })
    });

    this.chatHistory.appendChild(messageDiv);

    // Animate text character by character
    let currentText = '';
    for (let i = 0; i < text.length; i++) {
        currentText += text[i];
        messageDiv.textContent = currentText;
        await new Promise(resolve => setTimeout(resolve, 30)); // Adjust speed here
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
  }

  public async appendStreamingMessage(text: string, isComplete = false) {
    if (!this.chatHistory) return;

    let streamingMessage = this.chatHistory.querySelector('.streaming-message') as HTMLDivElement;
    if (!streamingMessage) {
        streamingMessage = document.createElement('div');
        streamingMessage.className = 'streaming-message message';
        Object.assign(streamingMessage.style, {
            marginBottom: '8px',
            padding: '12px',
            width: '80%',
            wordWrap: 'break-word',
            fontSize: '14px',
            fontFamily: 'PixelFont, monospace',
            backgroundColor: '#1E1B2D',
            color: '#4EEAFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        });

        // Create spinner inline
        const spinner = document.createElement('div');
        Object.assign(spinner.style, {
            width: '12px',
            height: '12px',
            border: '2px solid #4EEAFF',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        });
        
        streamingMessage.appendChild(spinner);
        this.chatHistory.appendChild(streamingMessage);
        this.accumulatedText = '';
    }

    if (text) {
        // Remove spinner when text starts coming in
        const spinner = streamingMessage.querySelector('div');
        if (spinner) {
            streamingMessage.removeChild(spinner);
        }
        
        this.accumulatedText += text;
        streamingMessage.textContent = this.accumulatedText;
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    if (isComplete) {
        streamingMessage.textContent = this.accumulatedText;
        streamingMessage.classList.remove('streaming-message');
        this.accumulatedText = '';
    }
  }

  private toggleSize() {
    if (!this.chatContainer) return;
    
    this.isEnlarged = !this.isEnlarged;
    
    Object.assign(this.chatContainer.style, {
        width: this.isEnlarged ? '800px' : '400px',
        height: this.isEnlarged ? '700px' : '500px'
    });
    
    // Update button icon
    const resizeButton = this.chatContainer.querySelector('button:first-of-type');
    if (resizeButton instanceof HTMLButtonElement) {
        resizeButton.textContent = this.isEnlarged ? '❐' : '□';
    }
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
    this.resizeButton?.removeEventListener('click', () => this.toggleSize());
    this.resizeButton = null;
  }
} 