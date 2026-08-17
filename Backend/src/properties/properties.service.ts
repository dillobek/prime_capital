import { Injectable, NotFoundException } from '@nestjs/common';
import type { PropertyListing } from '@prime/contracts';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** Prices are always in USD (matches the rest of the platform's investment balances) — never so'm/UZS. */
@Injectable()
export class PropertiesService {
  private readonly dataFile = process.env.PROPERTIES_DATA_FILE ?? '/app/data/properties.json';
  // No placeholder/demo listings — admin adds real ones via the panel, and they now persist across restarts and deploys.
  private items: PropertyListing[] = [];

  constructor() { this.load(); }
  private load() {
    if (!existsSync(this.dataFile)) return;
    try {
      const data = JSON.parse(readFileSync(this.dataFile, 'utf8'));
      if (Array.isArray(data)) this.items = data;
    } catch { /* Keep empty list when storage is invalid. */ }
  }
  private save() {
    mkdirSync(dirname(this.dataFile), { recursive: true });
    writeFileSync(this.dataFile, JSON.stringify(this.items, null, 2));
  }

  findAll(type?: string, status?: string) { return this.items.filter((item) => (!type || item.type === type) && (!status || item.status === status)); }
  findOne(id: string) { const item = this.items.find((entry) => entry.id === id); if (!item) throw new NotFoundException(); return item; }
  create(dto: Omit<PropertyListing, 'id'|'createdAt'>) { const item = { ...dto, id: `${Date.now()}`, createdAt: new Date().toISOString() }; this.items.unshift(item); this.save(); return item; }
  update(id: string, dto: Partial<PropertyListing>) { const item = this.findOne(id); Object.assign(item, dto, { id: item.id, createdAt: item.createdAt }); this.save(); return item; }
  remove(id: string) { const index = this.items.findIndex((entry) => entry.id === id); if (index < 0) throw new NotFoundException(); const removed = this.items.splice(index, 1)[0]; this.save(); return removed; }
}
