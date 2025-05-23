
"use client"; // This file might be imported by client components, but its store interaction is fine.

import { useConsoleLogStore } from '@/stores/consoleLogStore';

// This logger will send messages to our in-app console tool
export const appLogger = {
  log: (...args: any[]) => {
    console.log(...args); // Also log to browser console
    useConsoleLogStore.getState().addLogEntry('log', args);
  },
  info: (...args: any[]) => {
    console.info(...args);
    useConsoleLogStore.getState().addLogEntry('info', args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
    useConsoleLogStore.getState().addLogEntry('warn', args);
  },
  error: (...args: any[]) => {
    console.error(...args);
    useConsoleLogStore.getState().addLogEntry('error', args);
  },
  debug: (...args: any[]) => {
    console.debug(...args);
    useConsoleLogStore.getState().addLogEntry('debug', args);
  },
};
