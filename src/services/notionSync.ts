import type { Contact, PhoneNumber, BankAccount, Folder, NotionSyncConfig, NotionSyncResult } from '../types';
import * as db from './db';

const NOTION_API_ENDPOINT = '/api/notion';
const NOTION_DIRECT_PROXY = '/notion-api';

export function getEffectiveNotionConfig(customConfig?: NotionSyncConfig): { apiKey: string; databaseId: string } {
  const envApiKey = ((import.meta as any).env?.VITE_NOTION_API_KEY || (import.meta as any).env?.NOTION_API_KEY || '').trim();
  const envDbId = ((import.meta as any).env?.VITE_NOTION_DATABASE_ID || (import.meta as any).env?.NOTION_DATABASE_ID || '').trim();

  const apiKey = (customConfig?.apiKey?.trim() || envApiKey).trim();
  const databaseId = (customConfig?.databaseId?.trim() || envDbId).trim().replace(/-/g, '');

  return { apiKey, databaseId };
}

function getDirectHeaders(apiKey: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  return headers;
}

/**
 * Checks connection to Notion database (tries Vercel /api/notion first, falls back to direct proxy)
 */
export async function testNotionConnection(customConfig?: NotionSyncConfig): Promise<{ ok: boolean; title?: string; error?: string }> {
  const { apiKey, databaseId } = getEffectiveNotionConfig(customConfig);

  // 1. Try serverless endpoint (/api/notion) - works on Vercel with NOTION_API_KEY / NOTION_DATABASE_ID
  try {
    const params = new URLSearchParams({ action: 'status' });
    if (apiKey) params.set('apiKey', apiKey);
    if (databaseId) params.set('databaseId', databaseId);

    const res = await fetch(`${NOTION_API_ENDPOINT}?${params.toString()}`, {
      method: 'GET',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok) {
        return { ok: true, title: data.databaseTitle || 'Notion Database' };
      }
    }
  } catch {
    // serverless not available, fallback to direct proxy
  }

  // 2. Fallback to direct /notion-api proxy if credentials present on client
  if (!apiKey || !databaseId) {
    return {
      ok: false,
      error: 'Notion API Key or Database ID not found. Ensure NOTION_API_KEY and NOTION_DATABASE_ID are set in Vercel or Settings.',
    };
  }

  try {
    const res = await fetch(`${NOTION_DIRECT_PROXY}/databases/${databaseId}`, {
      method: 'GET',
      headers: getDirectHeaders(apiKey),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { ok: false, error: errJson.message || `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    const titleObj = data.title?.[0];
    return { ok: true, title: titleObj?.plain_text || 'Notion Database' };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to connect to Notion' };
  }
}

/**
 * Execute a complete Two-Way Sync between local IndexedDB and Notion Database
 */
export async function executeNotionSync(customConfig?: NotionSyncConfig): Promise<NotionSyncResult> {
  const { apiKey, databaseId } = getEffectiveNotionConfig(customConfig);

  // 1. Fetch current local state
  const localContacts = await db.getAllContacts();
  const localPhones = await db.getAllPhoneNumbers();
  const localBanks = await db.getAllBankAccounts();
  const localFolders = await db.getAllFolders();

  // 2. Try sync through serverless function (/api/notion) - best for Vercel
  try {
    const syncRes = await fetch(NOTION_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync',
        apiKey: apiKey || undefined,
        databaseId: databaseId || undefined,
        contacts: localContacts,
        phones: localPhones,
        banks: localBanks,
        folders: localFolders,
      }),
    });

    if (syncRes.ok) {
      const syncData = await syncRes.json();
      if (syncData.ok) {
        let pulledCount = 0;
        const pulledContacts = syncData.pulledContacts || [];

        // Track contacts by notionPageId and name
        const contactsByPageId = new Map<string, Contact>();
        const contactsByName = new Map<string, Contact>();
        for (const c of localContacts) {
          if (c.notionPageId) contactsByPageId.set(c.notionPageId, c);
          contactsByName.set(c.name.trim().toLowerCase(), c);
        }

        for (const remote of pulledContacts) {
          let matched = contactsByPageId.get(remote.pageId) || contactsByName.get(remote.name.trim().toLowerCase());

          // Resolve folder
          let folderId: string | null = matched?.folderId || null;
          if (remote.folderName) {
            let f = localFolders.find(lf => lf.name.toLowerCase() === remote.folderName.toLowerCase());
            if (!f) {
              f = {
                id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: remote.folderName,
                color: '#6366f1',
              };
              await db.saveFolder(f);
              localFolders.push(f);
            }
            folderId = f.id;
          }

          if (!matched) {
            const newId = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const newContact: Contact = {
              id: newId,
              name: remote.name,
              relationship: remote.relationship || undefined,
              notes: remote.notes || undefined,
              isFavorite: Boolean(remote.isFavorite),
              folderId,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              notionPageId: remote.pageId,
            };

            await db.saveContact(newContact);
            localContacts.push(newContact);
            contactsByPageId.set(remote.pageId, newContact);

            if (remote.phone) {
              const newPhone: PhoneNumber = {
                id: `phone_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                contactId: newId,
                label: 'Mobile',
                number: remote.phone,
                isPrimary: true,
              };
              await db.savePhoneNumbersForContact(newId, [newPhone]);
            }
            pulledCount++;
          } else {
            let updated = false;
            if (!matched.notionPageId) {
              matched.notionPageId = remote.pageId;
              updated = true;
            }
            if (!matched.relationship && remote.relationship) {
              matched.relationship = remote.relationship;
              updated = true;
            }
            if (!matched.notes && remote.notes) {
              matched.notes = remote.notes;
              updated = true;
            }
            if (folderId && !matched.folderId) {
              matched.folderId = folderId;
              updated = true;
            }

            if (updated) {
              matched.updatedAt = Date.now();
              await db.saveContact(matched);
              pulledCount++;
            }
          }
        }

        // Save last sync time in settings
        const settings = await db.getSettings();
        await db.saveSettings({
          ...settings,
          notionConfig: {
            ...(settings.notionConfig || {}),
            lastSyncedAt: Date.now(),
          },
        });

        return {
          success: true,
          pushedCount: syncData.pushedCount || 0,
          pulledCount,
          totalNotionRecords: syncData.totalNotionRecords || pulledContacts.length,
        };
      }
    }
  } catch (serverlessErr) {
    console.warn('Serverless sync failed, falling back to direct proxy:', serverlessErr);
  }

  // 3. Fallback: direct proxy sync
  if (!apiKey || !databaseId) {
    return {
      success: false,
      pushedCount: 0,
      pulledCount: 0,
      totalNotionRecords: 0,
      error: 'Notion API Key or Database ID not found. Set NOTION_API_KEY and NOTION_DATABASE_ID in Vercel or Settings.',
    };
  }

  try {
    const queryRes = await fetch(`${NOTION_DIRECT_PROXY}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: getDirectHeaders(apiKey),
      body: JSON.stringify({ page_size: 100 }),
    });

    if (!queryRes.ok) {
      const err = await queryRes.json().catch(() => ({}));
      throw new Error(err.message || `Query failed (${queryRes.status})`);
    }

    const data = await queryRes.json();
    const pages = data.results || [];
    let pulledCount = 0;
    let pushedCount = 0;

    const contactsByPageId = new Map<string, Contact>();
    const contactsByName = new Map<string, Contact>();
    for (const c of localContacts) {
      if (c.notionPageId) contactsByPageId.set(c.notionPageId, c);
      contactsByName.set(c.name.trim().toLowerCase(), c);
    }

    for (const page of pages) {
      const props = page.properties || {};
      const name = props.Name?.title?.[0]?.plain_text?.trim() || '';
      if (!name) continue;

      const phone = props.Phone?.phone_number || '';
      const relationship = props.Relationship?.select?.name || '';
      const isFavorite = Boolean(props.Favorite?.checkbox);
      const notes = props.Notes?.rich_text?.[0]?.plain_text || '';
      const folderName = props.Folder?.select?.name || '';

      let matched = contactsByPageId.get(page.id) || contactsByName.get(name.toLowerCase());

      let folderId: string | null = matched?.folderId || null;
      if (folderName) {
        let f = localFolders.find(lf => lf.name.toLowerCase() === folderName.toLowerCase());
        if (!f) {
          f = { id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: folderName, color: '#6366f1' };
          await db.saveFolder(f);
          localFolders.push(f);
        }
        folderId = f.id;
      }

      if (!matched) {
        const newId = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newContact: Contact = {
          id: newId,
          name,
          relationship: relationship || undefined,
          notes: notes || undefined,
          isFavorite,
          folderId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          notionPageId: page.id,
        };

        await db.saveContact(newContact);
        localContacts.push(newContact);
        contactsByPageId.set(page.id, newContact);

        if (phone) {
          const newPhone: PhoneNumber = {
            id: `phone_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            contactId: newId,
            label: 'Mobile',
            number: phone,
            isPrimary: true,
          };
          await db.savePhoneNumbersForContact(newId, [newPhone]);
        }
        pulledCount++;
      }
    }

    const remoteIds = new Set(pages.map((p: any) => p.id));
    for (const contact of localContacts) {
      if (!contact.notionPageId || !remoteIds.has(contact.notionPageId)) {
        const primaryPhone = localPhones.find(p => p.contactId === contact.id && p.isPrimary)?.number ||
          localPhones.find(p => p.contactId === contact.id)?.number;
        const folder = localFolders.find(f => f.id === contact.folderId);

        const properties: Record<string, any> = {
          Name: { title: [{ text: { content: contact.name || 'Unnamed' } }] },
          Favorite: { checkbox: Boolean(contact.isFavorite) },
        };
        if (primaryPhone) properties.Phone = { phone_number: primaryPhone };
        if (contact.relationship) properties.Relationship = { select: { name: contact.relationship } };
        if (contact.notes) properties.Notes = { rich_text: [{ text: { content: contact.notes.slice(0, 2000) } }] };
        if (folder?.name) properties.Folder = { select: { name: folder.name } };

        const createRes = await fetch(`${NOTION_DIRECT_PROXY}/pages`, {
          method: 'POST',
          headers: getDirectHeaders(apiKey),
          body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
        });

        if (createRes.ok) {
          const pageData = await createRes.json();
          contact.notionPageId = pageData.id;
          await db.saveContact(contact);
          pushedCount++;
          await new Promise(r => setTimeout(r, 350));
        }
      }
    }

    const settings = await db.getSettings();
    await db.saveSettings({
      ...settings,
      notionConfig: { ...(settings.notionConfig || {}), lastSyncedAt: Date.now() },
    });

    return {
      success: true,
      pushedCount,
      pulledCount,
      totalNotionRecords: pages.length + pushedCount,
    };
  } catch (err: any) {
    return {
      success: false,
      pushedCount: 0,
      pulledCount: 0,
      totalNotionRecords: 0,
      error: err.message || 'Error executing Notion sync',
    };
  }
}
