// src/app/api/admin/notion/export-database/[databaseId]/route.ts
import { NextResponse } from 'next/server';
import { getNotionClient } from '@/lib/notionClient';
import type { PageObjectResponse, PartialPageObjectResponse, DatabaseObjectResponse, PartialDatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const dynamic = 'force-dynamic';

// Helper function to transform Notion page properties
function transformNotionPageProperties(properties: PageObjectResponse['properties']): Record<string, any> {
  const transformed: Record<string, any> = {};
  for (const name in properties) {
    const property = properties[name];
    if (!property || !property.type) continue;

    // Ignore button, rollup, relation types
    if (['button', 'rollup', 'relation'].includes(property.type.toLowerCase())) {
      continue;
    }

    switch (property.type.toLowerCase()) {
      case 'title':
        transformed[name] = property.title?.[0]?.plain_text || null;
        break;
      case 'rich_text':
        transformed[name] = property.rich_text?.[0]?.plain_text || null;
        break;
      case 'number':
        transformed[name] = property.number;
        break;
      case 'select':
        transformed[name] = property.select?.name || null;
        break;
      case 'multi_select':
        transformed[name] = property.multi_select?.map((s: any) => s.name) || [];
        break;
      case 'status':
        transformed[name] = property.status?.name || null;
        break;
      case 'date':
        transformed[name] = property.date?.start || null;
        // Optionally add end date: if (property.date?.end) transformed[`${name}_end`] = property.date.end;
        break;
      case 'checkbox':
        transformed[name] = property.checkbox;
        break;
      case 'url':
        transformed[name] = property.url || null;
        break;
      case 'email':
        transformed[name] = property.email || null;
        break;
      case 'phone_number':
        transformed[name] = property.phone_number || null;
        break;
      case 'files':
        // Extract URL of the first file
        transformed[name] = (property.files?.length > 0)
          ? (property.files[0]?.file?.url || property.files[0]?.external?.url || null)
          : null;
        break;
      case 'created_time':
      case 'last_edited_time':
        transformed[name] = property[property.type] || null;
        break;
      case 'created_by':
      case 'last_edited_by':
        transformed[name] = property[property.type]?.id || null;
        break;
      case 'formula':
        const formula = property.formula;
        if (formula?.type === 'string') transformed[name] = formula.string;
        else if (formula?.type === 'number') transformed[name] = formula.number;
        else if (formula?.type === 'boolean') transformed[name] = formula.boolean;
        else if (formula?.type === 'date') transformed[name] = formula.date?.start;
        else transformed[name] = null;
        break;
      case 'unique_id':
         if (property.unique_id) {
            transformed[name] = property.unique_id.prefix 
                ? `${property.unique_id.prefix}-${property.unique_id.number}` 
                : property.unique_id.number;
        } else {
            transformed[name] = null;
        }
        break;
      default:
        // For unhandled types, you might want to log or store them differently
        // For now, we'll skip them to keep the output clean
        // transformed[name] = `[Unhandled Notion Type: ${property.type}]`;
        break;
    }
  }
  return transformed;
}


export async function GET(
  request: Request,
  { params }: { params: { databaseId: string } }
) {
  const databaseId = params.databaseId;

  if (!databaseId) {
    return NextResponse.json({ error: 'Database ID is required' }, { status: 400 });
  }

  if (!process.env.NOTION_API_KEY) {
    return NextResponse.json({ error: 'Notion API Key is not configured on the server.' }, { status: 500 });
  }

  try {
    const notion = await getNotionClient();
    let results: PageObjectResponse[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    const fetchedPageIds = new Set<string>(); // To avoid duplicates if pagination overlaps (rare)

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
        page_size: 100, // Max page size
      });
      
      const newResults = response.results.filter(
        (page): page is PageObjectResponse => 
          page.object === 'page' && !fetchedPageIds.has(page.id)
      ) as PageObjectResponse[];
      
      newResults.forEach(page => fetchedPageIds.add(page.id));
      results = results.concat(newResults);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;

      if (results.length >= 500 && hasMore) { // Safety break for large databases in a demo
        console.warn(`[Notion Export API] Fetched 500 pages for DB ${databaseId}, stopping due to demo limit. More pages might exist.`);
        hasMore = false; // Stop fetching
      }
    }
    
    const transformedResults = results.map(page => {
      return {
        notion_page_id: page.id, // Keep original Notion page ID for reference
        created_time: page.created_time,
        last_edited_time: page.last_edited_time,
        // icon: page.icon, // Could also be transformed
        // cover: page.cover, // Could also be transformed
        properties: transformNotionPageProperties(page.properties),
        // Optionally include URL: url: page.url
      };
    });

    return NextResponse.json(transformedResults);

  } catch (error: any) {
    console.error(`[Notion Export API] Failed to fetch or transform pages from Notion database ${databaseId}:`, error.message, error.stack);
    if (error.code === 'unauthorized' || error.status === 401) {
      return NextResponse.json(
        { error: 'Notion API request unauthorized. Check your API key and integration permissions for the database.' },
        { status: 401 }
      );
    }
     if (error.code === 'object_not_found' || error.status === 404) {
      return NextResponse.json(
        { error: `Notion database with ID "${databaseId}" not found or integration lacks access.` },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: `Failed to fetch pages from Notion database ${databaseId}.`, details: error.message },
      { status: 500 }
    );
  }
}
