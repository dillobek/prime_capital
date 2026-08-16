import { Injectable, NotFoundException } from '@nestjs/common';
import type { PropertyListing } from '@prime/contracts';

@Injectable()
export class PropertiesService {
  private readonly items: PropertyListing[] = [
    { id: '1', title: 'Prime Gardens, 2-xonali', type: 'new-build', location: 'Yunusobod', price: 1250000000, rooms: 2, area: 68, status: 'active', createdAt: '2026-08-15T10:32:00.000Z' },
    { id: '2', title: '111 Residence, 3-xonali', type: 'new-build', location: 'Chilonzor', price: 1780000000, rooms: 3, area: 92, status: 'active', createdAt: '2026-08-15T08:18:00.000Z' },
    { id: '3', title: 'Skyline Avenue, 2-xonali', type: 'resale', location: 'Mirzo Ulug‘bek', price: 860000000, rooms: 2, area: 58, status: 'pending', createdAt: '2026-08-15T06:05:00.000Z' },
  ];
  findAll(type?: string, status?: string) { return this.items.filter((item) => (!type || item.type === type) && (!status || item.status === status)); }
  findOne(id: string) { const item = this.items.find((entry) => entry.id === id); if (!item) throw new NotFoundException(); return item; }
  create(dto: Omit<PropertyListing, 'id'|'createdAt'>) { const item = { ...dto, id: `${Date.now()}`, createdAt: new Date().toISOString() }; this.items.unshift(item); return item; }
  update(id: string, dto: Partial<PropertyListing>) { const item = this.findOne(id); Object.assign(item, dto, { id: item.id, createdAt: item.createdAt }); return item; }
  remove(id: string) { const index = this.items.findIndex((entry) => entry.id === id); if (index < 0) throw new NotFoundException(); return this.items.splice(index, 1)[0]; }
}
