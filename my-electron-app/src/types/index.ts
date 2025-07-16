export interface AppConfig {
    appName: string;
    version: string;
    author: string;
}

export interface WindowOptions {
    width: number;
    height: number;
    resizable: boolean;
    fullscreen: boolean;
}

export type MessageType = 'info' | 'warning' | 'error';

export interface Message {
    type: MessageType;
    content: string;
    timestamp: Date;
}