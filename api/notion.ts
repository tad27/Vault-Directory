// api/notion.ts
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY || process.env.VITE_NOTION_API_KEY,
});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { databaseId } = await req.json();
    const targetDatabaseId = databaseId || process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID;

    if (!targetDatabaseId) {
      return new Response(JSON.stringify({ error: 'Database ID is required' }), { status: 400 });
    }

    const response = await notion.request<{ results: unknown[] }>({
      path: `databases/${targetDatabaseId}/query`,
      method: 'post',
    });

    return new Response(JSON.stringify(response.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}