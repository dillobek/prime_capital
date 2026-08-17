import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type { PropertyListing } from '@prime/contracts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}
  @Get() findAll(@Query('type') type?: string, @Query('status') status?: string) { return this.properties.findAll(type, status); }
  @Get(':id') findOne(@Param('id') id: string) { return this.properties.findOne(id); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Post() create(@Body() dto: Omit<PropertyListing, 'id'|'createdAt'>) { return this.properties.create(dto); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Patch(':id') update(@Param('id') id: string, @Body() dto: Partial<PropertyListing>) { return this.properties.update(id, dto); }

  @UseGuards(JwtAuthGuard) @Roles('admin')
  @Delete(':id') remove(@Param('id') id: string) { return this.properties.remove(id); }
}
