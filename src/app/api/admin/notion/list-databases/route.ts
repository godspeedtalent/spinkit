
// src/app/api/admin/notion/list-databases/route.ts
import { NextResponse } from 'next/server';
import { getNotionClient } from '@/lib/notionClient';
import type { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function GET() {
  if (!process.env.NOTION_API_KEY) {
    return NextResponse.json({ error: 'Notion API Key is not configured on the server.' }, { status: 500 });
  }

  try {
    const notion = await getNotionClient();
    // console.log('[Notion API Route] Attempting to search for databases...');
    const response = await notion.search({
      filter: {
        value: 'database',
        property: 'object',
      },
      sort: {
        direction: 'ascending',
        timestamp: 'last_edited_time',
      },
      // page_size: 100 // Fetch up to 100 databases
    });
    // console.log('[Notion API Route] Notion search response:', JSON.stringify(response.results, null, 2));


    const databases = response.results
      .filter((result): result is DatabaseObjectResponse => 'title' in result && Array.isArray(result.title))
      .map((db: DatabaseObjectResponse) => {
        let dbTitle = 'Untitled Database';
        if (db.title.length > 0 && db.title[0] && 'plain_text' in db.title[0]) {
          dbTitle = db.title[0].plain_text;
        }
        return { id: db.id, name: dbTitle };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    // console.log('[Notion API Route] Parsed databases:', databases);
    return NextResponse.json(databases);

  } catch (error: any) {
    console.error('[Notion API Route] Failed to fetch Notion databases:', error.message, error.stack);
    // Check for common Notion API errors
    if (error.code === 'unauthorized' || error.status === 401) {
      return NextResponse.json(
        { error: 'Notion API request unauthorized. Check your API key and integration permissions.' },
        { status: 401 }
      );
    }
    if (error.code === 'validation_error') {
      return NextResponse.json(
        { error: 'Notion API request validation error. Please check the request parameters.', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch Notion databases. An unexpected error occurred.', details: error.message },
      { status: 500 }
    );
  }
}

