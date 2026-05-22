import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'http';
import { EventEmitter } from 'events';

interface SseClient {
  userId: number;
  res: any;
}

@Injectable()
export class SseGateway implements OnModuleInit, OnModuleDestroy {
  private clients = new Map<number, SseClient[]>();
  private eventEmitter = new EventEmitter();

  onModuleInit() {
    this.eventEmitter.on('notification', this.handleNotification.bind(this));
  }

  onModuleDestroy() {
    this.eventEmitter.removeAllListeners('notification');
    this.clients.forEach((clientList) => {
      clientList.forEach((client) => {
        try {
          client.res.end();
        } catch (e) {
          console.error('Error closing SSE connection:', e);
        }
      });
    });
    this.clients.clear();
  }

  subscribe(userId: number, res: any) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    const client: SseClient = { userId, res };
    this.clients.get(userId)!.push(client);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write('\n');

    res.on('close', () => {
      this.unsubscribe(userId, res);
    });
  }

  unsubscribe(userId: number, res: any) {
    const clientList = this.clients.get(userId);
    if (clientList) {
      const index = clientList.findIndex((c) => c.res === res);
      if (index !== -1) {
        clientList.splice(index, 1);
        if (clientList.length === 0) {
          this.clients.delete(userId);
        }
      }
    }
  }

  sendNotification(userId: number, notification: any) {
    this.eventEmitter.emit('notification', userId, notification);
  }

  private handleNotification(userId: number, notification: any) {
    const clientList = this.clients.get(userId);
    if (clientList) {
      clientList.forEach((client) => {
        try {
          client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
        } catch (e) {
          console.error('Error sending SSE:', e);
          this.unsubscribe(userId, client.res);
        }
      });
    }
  }

  broadcast(notification: any) {
    this.clients.forEach((clientList, userId) => {
      clientList.forEach((client) => {
        try {
          client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
        } catch (e) {
          console.error('Error broadcasting SSE:', e);
          this.unsubscribe(userId, client.res);
        }
      });
    });
  }
}
