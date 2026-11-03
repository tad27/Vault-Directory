// api/notion.ts
import pkg from '@notionhq/client';
const Client: any = (pkg as any).Client || (pkg as any).default?.Client || pkg;

function getClient(overrideKey?: string) {
  const token = (overrideKey || process.env.NOTION_API_KEY || process.env.VITE_NOTION_API_KEY || '').trim();
  if (!token) {
    throw new Error('Notion API Key not configured. Please set NOTION_API_KEY in Vercel or Settings.');
  }
  return new Client({ auth: token });
}

function getDatabaseId(overrideDbId?: string) {
  const id = (overrideDbId || process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID || '').trim().replace(/-/g, '');
  if (!id) {
    throw new Error('Notion Database ID not configured. Please set NOTION_DATABASE_ID in Vercel or Settings.');
  }
  return id;
}

export default async function handler(req: any, res?: any) {
  // Helper to send response across Web Standard (Request/Response), Express (res.status), and Node.js ServerResponse (res.statusCode/res.end)
  const sendResponse = (data: any, status = 200) => {
    if (res) {
      if (typeof res.status === 'function' && typeof res.json === 'function') {
        return res.status(status).json(data);
      }
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return;
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    let method = 'GET';
    let body: any = {};
    let query: Record<string, string> = {};

    if (req.method) {
      method = req.method.toUpperCase();
    }

    // Extract body and query parameters across environments
    if (typeof req.json === 'function') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    } else if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    if (req.url) {
      try {
        const parsedUrl = new URL(req.url, 'http://localhost');
        parsedUrl.searchParams.forEach((val, key) => {
          query[key] = val;
        });
      } catch {
        // ignore
      }
    }
    if (req.query) {
      query = { ...query, ...req.query };
    }

    const action = body.action || query.action || (method === 'GET' ? 'status' : 'query');
    const apiKey = body.apiKey || query.apiKey;
    const databaseId = body.databaseId || query.databaseId;

    const notion = getClient(apiKey);
    const targetDatabaseId = getDatabaseId(databaseId);

    // 1. Status / Test Connection
    if (action === 'status' || action === 'test') {
      const dbInfo: any = await notion.databases.retrieve({ database_id: targetDatabaseId });
      const titleObj = dbInfo?.title?.[0];
      const title = titleObj?.plain_text || 'Notion Database';
      return sendResponse({
        ok: true,
        databaseTitle: title,
        databaseId: targetDatabaseId,
        hasKey: true,
      });
    }

    // Helper to query database records across Notion API versions
    const fetchDatabasePages = async () => {
      try {
        const dbInfo: any = await notion.databases.retrieve({ database_id: targetDatabaseId });
        const dataSourceId = dbInfo.data_sources?.[0]?.id;
        if (dataSourceId && typeof notion.dataSources?.query === 'function') {
          const res = await notion.dataSources.query({ data_source_id: dataSourceId });
          return res?.results || [];
        }
      } catch (e) {
        console.warn('dataSources.query attempt failed:', e);
      }

      try {
        const res: any = await notion.request({
          path: `databases/${targetDatabaseId}/query`,
          method: 'post',
        });
        return res?.results || [];
      } catch {
        return [];
      }
    };

    // 2. Query Database Records
    if (action === 'query') {
      const pages = await fetchDatabasePages();
      return sendResponse({
        ok: true,
        results: pages,
      });
    }

    // 3. Create Page in Database
    if (action === 'create') {
      if (!body.properties) {
        return sendResponse({ ok: false, error: 'Missing properties payload' }, 400);
      }

      const newPage: any = await notion.pages.create({
        parent: { database_id: targetDatabaseId },
        properties: body.properties,
      });

      return sendResponse({
        ok: true,
        pageId: newPage.id,
        page: newPage,
      });
    }

    // 4. Update Existing Page
    if (action === 'update') {
      if (!body.pageId || !body.properties) {
        return sendResponse({ ok: false, error: 'Missing pageId or properties' }, 400);
      }

      const updatedPage: any = await notion.pages.update({
        page_id: body.pageId,
        properties: body.properties,
      });

      return sendResponse({
        ok: true,
        pageId: updatedPage.id,
      });
    }

    // 5. Full Two-Way Sync
    if (action === 'sync') {
      const pages = await fetchDatabasePages();
      const remoteContacts = pages.map((page: any) => {
        const props = page.properties || {};
        const nameProp = props.Name || props.name || props.Title || props.title;
        let name = '';
        if (nameProp?.title && Array.isArray(nameProp.title)) {
          name = nameProp.title.map((t: any) => t.plain_text || t.text?.content || '').join('').trim();
        }

        const phone = props.Phone?.phone_number || props.phone?.phone_number || '';
        const relationship = props.Relationship?.select?.name || props.relationship?.select?.name || '';
        const isFavorite = Boolean(props.Favorite?.checkbox || props.favorite?.checkbox);
        
        let notes = '';
        if (props.Notes?.rich_text && Array.isArray(props.Notes.rich_text)) {
          notes = props.Notes.rich_text.map((t: any) => t.plain_text || t.text?.content || '').join('').trim();
        }

        const folderName = props.Folder?.select?.name || props.folder?.select?.name || '';

        return {
          pageId: page.id,
          name,
          phone,
          relationship,
          isFavorite,
          notes,
          folderName,
        };
      }).filter((c: any) => Boolean(c.name));

      const localContacts = Array.isArray(body.contacts) ? body.contacts : [];
      const localPhones = Array.isArray(body.phones) ? body.phones : [];
      const localFolders = Array.isArray(body.folders) ? body.folders : [];

      let pushedCount = 0;
      const remotePageIds = new Set(remoteContacts.map((r: any) => r.pageId));

      // Push local contacts that aren't yet in Notion
      for (const contact of localContacts) {
        if (!contact.notionPageId || !remotePageIds.has(contact.notionPageId)) {
          const primaryPhone = localPhones.find((p: any) => p.contactId === contact.id && p.isPrimary)?.number ||
            localPhones.find((p: any) => p.contactId === contact.id)?.number;
          const folder = localFolders.find((f: any) => f.id === contact.folderId);

          const properties: Record<string, any> = {
            Name: { title: [{ text: { content: contact.name || 'Unnamed' } }] },
            Favorite: { checkbox: Boolean(contact.isFavorite) },
          };
          if (primaryPhone) {
            properties.Phone = { phone_number: primaryPhone };
          }
          if (contact.relationship) {
            properties.Relationship = { select: { name: contact.relationship } };
          }
          if (contact.notes) {
            properties.Notes = { rich_text: [{ text: { content: contact.notes.slice(0, 2000) } }] };
          }
          if (folder?.name) {
            properties.Folder = { select: { name: folder.name } };
          }

          try {
            const createdPage: any = await notion.pages.create({
              parent: { database_id: targetDatabaseId },
              properties,
            });
            contact.notionPageId = createdPage.id;
            pushedCount++;
            await new Promise(r => setTimeout(r, 350));
          } catch (e) {
            console.error('Error pushing contact to Notion:', e);
          }
        }
      }

      return sendResponse({
        ok: true,
        pushedCount,
        pulledContacts: remoteContacts,
        totalNotionRecords: remoteContacts.length + pushedCount,
      });
    }

    return sendResponse({ ok: false, error: `Unknown action: ${action}` }, 400);
  } catch (error: any) {
    console.error('Notion API Error:', error);
    return sendResponse({ ok: false, error: error.message || 'Internal Notion server error' }, 500);
  }
}