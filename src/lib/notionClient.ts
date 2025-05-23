
"use server"; // THIS MUST BE THE VERY FIRST LINE

import { Client } from '@notionhq/client';

let notionClientInstance: Client | null = null;

export async function getNotionClient(): Promise<Client> {
  if (!process.env.NOTION_API_KEY) {
    console.error('NOTION_API_KEY environment variable is not set.');
    throw new Error('Notion API key is not configured on the server.');
  }

  if (!notionClientInstance) {
    try {
      notionClientInstance = new Client({ auth: process.env.NOTION_API_KEY });
      if (process.env.NODE_ENV === 'development') {
        console.log('[NotionClient] Successfully initialized Notion client.');
      }
    } catch (error) {
      console.error('[NotionClient] Failed to initialize Notion client:', error);
      throw new Error('Failed to initialize Notion client.');
    }
  }
  return notionClientInstance;
}
