// src/Dialog.ts
import Phaser from 'phaser';

enum DialogState {
  HIDDEN = 'HIDDEN',
  TYPING = 'TYPING',
  SHOWING = 'SHOWING',
  SHOWING_OPTIONS = 'SHOWING_OPTIONS'
}

interface DialogOption {
  text: string;
  callback: () => void;
}

export default class Dialog {
  private scene: Phaser.Scene;
  private dialogBox: Phaser.GameObjects.Rectangle;
  private dialogText: Phaser.GameObjects.Text;
  private currentOptions?: DialogOption[];
  
  // 用枚举管理所有状态
  public state: DialogState = DialogState.HIDDEN;

  private fullText: string = '';
  private currentIndex: number = 0;
  private typingTimer?: Phaser.Time.TimerEvent;

  private queue: Array<{ text: string; options?: DialogOption[] }> = [];
  private onCompleteCallback?: () => void;

  private optionsContainer?: Phaser.GameObjects.Container;
  private modalOverlay?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, height: number = 100) {
    this.scene = scene;
    const bgWidth = this.scene.data.get('bgWidth');
    const bgHeight = this.scene.data.get('bgHeight');

    this.dialogBox = this.scene.add.rectangle(
      Math.max(this.scene.cameras.main.width, bgWidth) / 2,
      this.scene.cameras.main.height * 0.8,
      Math.max(this.scene.cameras.main.width, bgWidth),
      this.scene.cameras.main.height * 0.2,
      0x000000,
      0.7
    )
    .setScrollFactor(0)
    .setVisible(false)
    .setDepth(10)
    .setInteractive(); 

    this.dialogText = this.scene.add.text(
      this.dialogBox.x,
      this.dialogBox.y,
      '',
      { 
        fontSize: '16px', 
        color: '#ffffff', 
        wordWrap: { width: bgWidth - 50 } 
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false)
    .setDepth(11);

    // 点击对话框时的处理
    this.dialogBox.on('pointerup', () => {
      switch (this.state) {
        case DialogState.TYPING:
          // 如果正在打字，加速到完整文本
          this.finishTyping(this.currentOptions);
          break;
        case DialogState.SHOWING:
          // 如果打字结束、且没有选项，就直接关闭对话走下一个
          this.hide();
          break;
        case DialogState.SHOWING_OPTIONS:
          // 如果正在显示选项，通常不做关闭（或你可以决定怎样处理）
          break;
      }
    });
  }

  /**
   * 显示一系列对话
   */
  public showDialogs(
    dialogs: Array<{ text: string; options?: DialogOption[] }>,
    onComplete?: () => void
  ) {
    this.queue.push(...dialogs);
    if (this.state === DialogState.HIDDEN) {
      this.onCompleteCallback = onComplete;
      this.showNextDialog();
    }
  }

  private showNextDialog() {
    if (this.queue.length === 0) {
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
        this.onCompleteCallback = undefined;
      }
      // 无对话，隐藏
      this.state = DialogState.HIDDEN;
      return;
    }

    const { text, options } = this.queue.shift()!;
    this.currentOptions = options;
    this.fullText = text;
    this.currentIndex = 0;
    this.dialogText.setText('');

    this.dialogBox.setVisible(true);
    this.dialogText.setVisible(true);

    // 进入 TYPING 状态
    this.state = DialogState.TYPING;
    // 开始类型写入效果
    this.typingTimer = this.scene.time.addEvent({
      delay: 500,
      callback: () => this.typeNextCharacter(options),
      loop: true
    });
  }

  private typeNextCharacter(options?: DialogOption[]) {
    if (this.currentIndex < this.fullText.length) {
      this.dialogText.setText(this.dialogText.text + this.fullText[this.currentIndex]);
      this.currentIndex++;
    } else {
      // 打字完成
      this.finishTyping();
      
      // 若有选项，进入 SHOWING_OPTIONS 状态
      if (options && options.length > 0) {
        this.state = DialogState.SHOWING_OPTIONS;
        this.showOptions(options);
      } else {
        // 否则进入 SHOWING 状态
        this.state = DialogState.SHOWING;
      }
    }
  }

  private finishTyping(options?: DialogOption[]) {
    if (this.typingTimer) {
      this.typingTimer.remove(false);
      this.typingTimer = undefined;
    }
    // 直接显示完整文本
    this.dialogText.setText(this.fullText);
    this.currentIndex = this.fullText.length;
    
    // ========== 新增的逻辑 ========== 
    // 若本对话实际上有选项，并且当前还没进入SHOWING_OPTIONS，就进入
    if (options && options.length > 0) {
      this.state = DialogState.SHOWING_OPTIONS;
      this.showOptions(options);
    } else {
      // 否则就是普通 SHOWING
      this.state = DialogState.SHOWING;
    }
  }  

  /**
   * 隐藏对话框并显示下一个对话
   */
  private hide() {
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);

    // 如果有选项，清理
    this.closeOptions();

    this.state = DialogState.HIDDEN;
    // 显示队列中的下一个对话
    this.showNextDialog();
  }

  /**
   * 显示选项
   */
  private showOptions(options: DialogOption[]) {
    const bgWidth = this.scene.data.get('bgWidth');
    const bgHeight = this.scene.data.get('bgHeight');

    // 创建遮罩
    this.modalOverlay = this.scene.add.rectangle(
      bgWidth / 2,
      bgHeight / 2,
      bgWidth,
      bgHeight,
      0x000000,
      0.5
    )
    .setDepth(20)
    .setInteractive();

    // 创建选项容器
    this.optionsContainer = this.scene.add.container(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2
    )
    .setDepth(21)
    .setScrollFactor(0);

    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonSpacing = 20;
    const totalHeight = options.length * (buttonHeight + buttonSpacing) - buttonSpacing;
    const startY = -totalHeight / 2;

    options.forEach((option, index) => {
      const yPos = startY + index * (buttonHeight + buttonSpacing);

      const buttonBG = this.scene.add.rectangle(
        0,
        yPos,
        buttonWidth,
        buttonHeight,
        0x555555
      )
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .on('pointerover', () => buttonBG.setFillStyle(0x777777))
      .on('pointerout', () => buttonBG.setFillStyle(0x555555))
      .on('pointerdown', () => {
        option.callback();
        setTimeout(() => {
          this.closeOptions();
          this.hide();
        }, 10);
      });

      const buttonText = this.scene.add.text(
        0,
        yPos,
        option.text,
        { fontSize: '18px', color: '#ffffff' }
      ).setOrigin(0.5);

      this.optionsContainer!.add([buttonBG, buttonText]);
    });

    // 阻止点击透传
    this.modalOverlay.on('pointerdown', () => {
      // 空操作：不关闭选项
    });
  }

  private closeOptions() {
    if (this.optionsContainer) {
      this.optionsContainer.destroy();
      this.optionsContainer = undefined;
    }
    if (this.modalOverlay) {
      this.modalOverlay.destroy();
      this.modalOverlay = undefined;
    }
  }
  /**
   * 判断点击是否落在对话区域
   */
  public isContained(x: number, y: number): boolean {
    console.log(this.state);
    // 如果正在显示对话或选项，都算"占据屏幕"
    if (this.state === DialogState.HIDDEN) {
      return false;
    }
    if (this.state === DialogState.SHOWING_OPTIONS) {
      return true  
    }
    else {
      return this.dialogBox.getBounds().contains(x, y);
    }
  }

  public destroy() {
    // Remove any DOM elements or event listeners
    this.optionsContainer?.destroy();
    this.optionsContainer = undefined;
    this.modalOverlay?.destroy();
    this.modalOverlay = undefined;
  }
}
