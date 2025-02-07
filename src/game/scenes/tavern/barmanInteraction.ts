// scenes/tavern/BarmanInteraction.ts
import Phaser from 'phaser';
import Player from '../../heroes/player';
import Barman from '../../heroes/barman';
import Dialog from '../../menu/dialog';
import { ChatWindow } from '../../menu/chatWindow';

export class BarmanInteraction {
  private scene: Phaser.Scene;
  private player: Player;
  private barman: Barman;
  private gridSize: number;
  private dialog: Dialog;
  private chatWindow: ChatWindow;
  private isDialogVisible = false;

  constructor(scene: Phaser.Scene, player: Player, barman: Barman, gridSize: number) {
    this.scene = scene;
    this.player = player;
    this.barman = barman;
    this.gridSize = gridSize;
    this.chatWindow = new ChatWindow((message) => this.handleBarmanResponse(message));
  }

  public handleBarmanInteraction() {
    const distance = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.barman.sprite.x,
      this.barman.sprite.y
    );
    const maxDistance = this.gridSize * 5;
  
    if (distance <= maxDistance) {
      if (this.isDialogVisible) return;
      this.isDialogVisible = true;

      this.dialog = new Dialog(this.scene);
      const dialogs = [
        { text: "欢迎光临！需要什么帮助吗？" },
        { 
          text: "这里是我们镇上最好的酒馆。请选择一个选项：",
          options: [
            { text: "聊天", callback: () => this.startChat() },
            { text: "购买饮料", callback: () => console.log('购买饮料') },  
            { text: "查看菜单", callback: () => console.log('查看菜单') },
            { text: "离开", callback: () => this.endDialog() }
          ]
        }
      ];
      this.dialog.showDialogs(dialogs);
    } else {
      console.log('你离 Barman 太远了。');
    }
  }

  private startChat() {
    this.endDialog();
    this.chatWindow.show();
    this.chatWindow.addMessage('Welcome! How can I help you today?', 'barman');
  }

  private handleBarmanResponse(userMessage: string) {
    this.chatWindow.addMessage(userMessage, 'user');
    const response = `Thanks for your message: "${userMessage}". How else can I help?`;
    setTimeout(() => {
      this.chatWindow.addMessage(response, 'barman');
    }, 1000);
  }

  private endDialog() {
    this.isDialogVisible = false;
    if (this.dialog && 'destroy' in this.dialog) {
      this.dialog.destroy();
    }
  }

  public destroy() {
    this.chatWindow.destroy();
    this.dialog?.destroy();
  }

  public isContained(x: number, y: number): boolean {
    return this.dialog?.isContained(x, y) || false;
  }
}
