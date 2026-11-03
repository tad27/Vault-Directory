import type { Contact, PhoneNumber, BankAccount, Folder, NotionSyncConfig, NotionSyncResult } from '../types';
import * as db from './db';

// Base API route proxied by Vite to https://api.notion.com/v1
const NOTION_API_BASE = '/notion-api';

export function getEffectiveNotionConfig(customConfig?: NotionSyncConfig): { apiKey: string; databaseId: string } {
  const envApiKey = (import.meta as any).env?.VITE_NOTION_API_KEY || '';
  const envDbId = (import.meta as any).env?.VITE_NOTION_DATABASE_ID || '';

  const apiKey = (customConfig?.apiKey?.trim() || envApiKey).trim();
  const databaseId = (customConfig?.databaseId?.trim() || envDbId).trim().replace(/-/g, '');

  return { apiKey, databaseId };
}

function getRequestHeaders(apiKey: string): HeadersInit {
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
 * Checks connection to Notion database
 */
export async function testNotionConnection(customConfig?: NotionSyncConfig): Promise<{ ok: boolean; title?: string; error?: string }> {
  const { apiKey, databaseId } = getEffectiveNotionConfig(customConfig);

  if (!apiKey) {
    return { ok: false, error: 'Notion API Key is missing. Check .env or Settings.' };
  }
  if (!databaseId) {
    return { ok: false, error: 'Notion Database ID is missing. Check .env or Settings.' };
  }

  try {
    const res = await fetch(`${NOTION_API_BASE}/databases/${databaseId}`, {
      method: 'GET',
      headers: getRequestHeaders(apiKey),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.message || `HTTP ${res.status}: ${res.statusText}`;
      return { ok: false, error: msg };
    }

    const data = await res.json();
    const titleObj = data.title?.[0];
    const title = titleObj?.plain_text || 'Notion Contacts Database';

    return { ok: true, title };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to connect to Notion' };
  }
}

interface NotionPageRaw {
  id: string;
  in_trash?: boolean;
  archived?: boolean;
  properties: Record<string, any>;
}

export interface ParsedNotionRecord {
  pageId: string;
  name: string;
  phone?: string;
  relationship?: string;
  isFavorite: boolean;
  notes?: string;
  bankDetails?: string;
  folderName?: string;
}

function parseNotionPage(page: NotionPageRaw): ParsedNotionRecord | null {
  const props = page.properties;
  if (!props) return null;

  // Title / Name
  const nameProp = props.Name || props.name || props.Title || props.title;
  let name = '';
  if (nameProp?.title && Array.isArray(nameProp.title)) {
    name = nameProp.title.map((t: any) => t.plain_text || t.text?.content || '').join('').trim();
  }
  if (!name) return null;

  // Phone
  let phone = '';
  const phoneProp = props.Phone || props.phone;
  if (phoneProp?.phone_number) {
    phone = phoneProp.phone_number.trim();
  }

  // Relationship
  let relationship = '';
  const relProp = props.Relationship || props.relationship;
  if (relProp?.select?.name) {
    relationship = relProp.select.name.trim();
  }

  // Favorite
  let isFavorite = false;
  const favProp = props.Favorite || props.favorite;
  if (favProp?.checkbox !== undefined) {
    isFavorite = Boolean(favProp.checkbox);
  }

  // Notes
  let notes = '';
  const notesProp = props.Notes || props.notes;
  if (notesProp?.rich_text && Array.isArray(notesProp.rich_text)) {
    notes = notesProp.rich_text.map((t: any) => t.plain_text || t.text?.content || '').join('').trim();
  }

  // Bank Accounts text
  let bankDetails = '';
  const bankProp = props['Bank Accounts'] || props['Bank'] || props.bank;
  if (bankProp?.rich_text && Array.isArray(bankProp.rich_text)) {
    bankDetails = bankProp.rich_text.map((t: any) => t.plain_text || t.text?.content || '').join('').trim();
  }

  // Folder / Label
  let folderName = '';
  const folderProp = props.Folder || props.folder || props.Label || props.label;
  if (folderProp?.select?.name) {
    folderName = folderProp.select.name.trim();
  }

  return {
    pageId: page.id,
    name,
    phone,
    relationship,
    isFavorite,
    notes,
    bankDetails,
    folderName,
  };
}

/**
 * Fetch all pages from the Notion database
 */
export async function fetchNotionRecords(customConfig?: NotionSyncConfig): Promise<{ records: ParsedNotionRecord[]; databaseTitle: string }> {
  const { apiKey, databaseId } = getEffectiveNotionConfig(customConfig);

  const res = await fetch(`${NOTION_API_BASE}/databases/${databaseId}/query`, {
    method: 'POST',
    headers: getRequestHeaders(apiKey),
    body: JSON.stringify({
      page_size: 100,
      filter: {
        property: 'Name',
        title: {
          is_not_empty: true,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to query database (${res.status})`);
  }

  const data = await res.json();
  const pages: NotionPageRaw[] = data.results || [];
  const records = pages
    .filter(p => !p.in_trash && !p.archived)
    .map(parseNotionPage)
    .filter((r): r is ParsedNotionRecord => Boolean(r));

  return { records, databaseTitle: 'Notion Database' };
}

/**
 * Format contact fields into Notion page properties payload
 */
function buildNotionProperties(
  contact: Contact,
  primaryPhone?: string,
  bankSummary?: string,
  folderName?: string
) {
  const properties: Record<string, any> = {
    Name: {
      title: [{ text: { content: contact.name || 'Unnamed' } }],
    },
    Favorite: {
      checkbox: Boolean(contact.isFavorite),
    },
  };

  if (primaryPhone) {
    properties.Phone = {
      phone_number: primaryPhone,
    };
  }

  if (contact.relationship) {
    properties.Relationship = {
      select: { name: contact.relationship },
    };
  }

  if (contact.notes) {
    properties.Notes = {
      rich_text: [{ text: { content: contact.notes.slice(0, 2000) } }],
    };
  }

  if (bankSummary) {
    properties['Bank Accounts'] = {
      rich_text: [{ text: { content: bankSummary.slice(0, 2000) } }],
    };
  }

  if (folderName) {
    properties.Folder = {
      select: { name: folderName },
    };
  }

  return properties;
}

/**
 * Push a single contact to Notion (create or update page)
 */
export async function pushContactToNotion(
  contact: Contact,
  phones: PhoneNumber[],
  banks: BankAccount[],
  folders: Folder[],
  customConfig?: NotionSyncConfig
): Promise<string> {
  const { apiKey, databaseId } = getEffectiveNotionConfig(customConfig);
  const primaryPhone = phones.find(p => p.isPrimary)?.number || phones[0]?.number;
  const folder = folders.find(f => f.id === contact.folderId);
  const bankSummary = banks.length > 0
    ? banks.map(b => `${b.bankName}: ${b.accountNumber} (${b.accountHolder})`).join(' | ')
    : undefined;

  const properties = buildNotionProperties(contact, primaryPhone, bankSummary, folder?.name);

  // If already linked to a Notion page, attempt update
  if (contact.notionPageId) {
    try {
      const updateRes = await fetch(`${NOTION_API_BASE}/pages/${contact.notionPageId}`, {
        method: 'PATCH',
        headers: getRequestHeaders(apiKey),
        body: JSON.stringify({ properties }),
      });

      if (updateRes.ok) {
        return contact.notionPageId;
      }
    } catch {
      // Fall through to create if page not found or archived
    }
  }

  // Create new page
  const createRes = await fetch(`${NOTION_API_BASE}/pages`, {
    method: 'POST',
    headers: getRequestHeaders(apiKey),
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create Notion page (${createRes.status})`);
  }

  const pageData = await createRes.json();
  return pageData.id;
}

/**
 * Execute a complete Two-Way Sync between local IndexedDB and Notion Database
 */
export async function executeNotionSync(customConfig?: NotionSyncConfig): Promise<NotionSyncResult> {
  const { apiKey, databaseId } = getEffectiveNotionConfig(customConfig);

  if (!apiKey || !databaseId) {
    return {
      success: false,
      pushedCount: 0,
      pulledCount: 0,
      totalNotionRecords: 0,
      error: 'Notion API Key or Database ID not found.',
    };
  }

  try {
    // 1. Fetch current local state
    const localContacts = await db.getAllContacts();
    const localPhones = await db.getAllPhoneNumbers();
    const localBanks = await db.getAllBankAccounts();
    const localFolders = await db.getAllFolders();

    // 2. Fetch all Notion pages
    const { records: notionRecords } = await fetchNotionRecords(customConfig);

    let pulledCount = 0;
    let pushedCount = 0;

    // Track contacts by notionPageId and name
    const contactsByPageId = new Map<string, Contact>();
    const contactsByName = new Map<string, Contact>();
    for (const c of localContacts) {
      if (c.notionPageId) contactsByPageId.set(c.notionPageId, c);
      contactsByName.set(c.name.trim().toLowerCase(), c);
    }

    // 3. Step A: PULL (Import from Notion into local database)
    for (const notionRec of notionRecords) {
      let matchedContact = contactsByPageId.get(notionRec.pageId) || contactsByName.get(notionRec.name.trim().toLowerCase());

      // Resolve folder if present
      let folderId: string | null = matchedContact?.folderId || null;
      if (notionRec.folderName) {
        let f = localFolders.find(lf => lf.name.toLowerCase() === notionRec.folderName?.toLowerCase());
        if (!f) {
          f = {
            id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: notionRec.folderName,
            color: '#6366f1',
          };
          await db.saveFolder(f);
          localFolders.push(f);
        }
        folderId = f.id;
      }

      if (!matchedContact) {
        // Create new local contact from Notion
        const newContactId = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newContact: Contact = {
          id: newContactId,
          name: notionRec.name,
          relationship: notionRec.relationship || undefined,
          notes: notionRec.notes || undefined,
          isFavorite: notionRec.isFavorite,
          folderId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          notionPageId: notionRec.pageId,
        };

        await db.saveContact(newContact);
        localContacts.push(newContact);
        contactsByPageId.set(notionRec.pageId, newContact);
        contactsByName.set(newContact.name.trim().toLowerCase(), newContact);

        // Add phone if present
        if (notionRec.phone) {
          const newPhone: PhoneNumber = {
            id: `phone_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            contactId: newContactId,
            label: 'Mobile',
            number: notionRec.phone,
            isPrimary: true,
          };
          await db.savePhoneNumbersForContact(newContactId, [newPhone]);
          localPhones.push(newPhone);
        }

        pulledCount++;
      } else {
        // Link notionPageId if not linked
        let updated = false;
        if (!matchedContact.notionPageId) {
          matchedContact.notionPageId = notionRec.pageId;
          updated = true;
        }

        // If local contact has missing fields that Notion has, pull them in
        if (!matchedContact.relationship && notionRec.relationship) {
          matchedContact.relationship = notionRec.relationship;
          updated = true;
        }
        if (!matchedContact.notes && notionRec.notes) {
          matchedContact.notes = notionRec.notes;
          updated = true;
        }
        if (folderId && !matchedContact.folderId) {
          matchedContact.folderId = folderId;
          updated = true;
        }

        if (updated) {
          matchedContact.updatedAt = Date.now();
          await db.saveContact(matchedContact);
          pulledCount++;
        }
      }
    }

    // 4. Step B: PUSH (Send local contacts that are not yet in Notion to Notion)
    const existingNotionPageIds = new Set(notionRecords.map(r => r.pageId));

    for (const contact of localContacts) {
      const needsPush = !contact.notionPageId || !existingNotionPageIds.has(contact.notionPageId);

      if (needsPush) {
        const contactPhones = localPhones.filter(p => p.contactId === contact.id);
        const contactBanks = localBanks.filter(b => b.contactId === contact.id);

        try {
          const pageId = await pushContactToNotion(
            contact,
            contactPhones,
            contactBanks,
            localFolders,
            customConfig
          );

          contact.notionPageId = pageId;
          contact.updatedAt = Date.now();
          await db.saveContact(contact);
          pushedCount++;

          // Respect Notion API rate limits (~3 req/sec)
          await new Promise(resolve => setTimeout(resolve, 350));
        } catch (pushErr) {
          console.error(`Failed to push contact "${contact.name}" to Notion:`, pushErr);
        }
      }
    }

    // 5. Update last sync time in settings
    const settings = await db.getSettings();
    const updatedConfig: NotionSyncConfig = {
      ...(settings.notionConfig || {}),
      lastSyncedAt: Date.now(),
    };
    await db.saveSettings({
      ...settings,
      notionConfig: updatedConfig,
    });

    return {
      success: true,
      pushedCount,
      pulledCount,
      totalNotionRecords: notionRecords.length + pushedCount,
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
