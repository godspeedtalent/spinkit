"use client";

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  TARGET_MONGO_FIELDS_MAP,
  DO_NOT_IMPORT_VALUE,
  CREATE_NEW_FIELD_VALUE,
  getEntityTypeLabel,
} from '@/config/data-import-config';

// Interfaces moved here from ImportDataSection
export interface StagedPayloadItem {
  name?: string; // Name of the source table/database (from generic JSON or derived)
  databaseName?: string; // Specifically for Notion exports, if present
  databaseId?: string; // Specifically for Notion exports, if present
  records: any[]; // All original records from this table/database
  previewRecords?: any[]; // A smaller sample for UI preview
  detectedColumns?: string[]; // Columns detected for this specific table
}

export interface StagedDataFormat {
  driver: "notion" | "mongodb" | "localJson" | "notion_template" | "json_template" | "json_flat_object" | "unknown" | "mongodb_spinkit";
  driverInfo?: string; // User-friendly name of the driver/format
  payload: StagedPayloadItem[];
  selectedEntities?: string[]; // For template generation, names of entities included
  exportDate?: string; // For imported SpinKit exports
}

// Helper function to check if a Notion property should be considered empty for completeness checks
export const isNotionPropertyEmpty = (propValue: any): boolean => {
  if (propValue === null || propValue === undefined) return true;
  const ignoredTypes = ['button', 'rollup', 'relation']; // Keep relation here if we are not processing it for values
  if (propValue.type && ignoredTypes.includes(String(propValue.type).toLowerCase())) return true;

  switch (String(propValue.type).toLowerCase()) {
    case 'title': return !propValue.title?.[0]?.plain_text?.trim();
    case 'rich_text': return !propValue.rich_text?.[0]?.plain_text?.trim();
    case 'number': return propValue.number === null || propValue.number === undefined;
    case 'select': return !propValue.select?.name?.trim();
    case 'multi_select': return !propValue.multi_select || propValue.multi_select.length === 0;
    case 'status': return !propValue.status?.name?.trim();
    case 'date': return !propValue.date?.start;
    case 'checkbox': return propValue.checkbox === null || propValue.checkbox === undefined;
    case 'url': return !propValue.url?.trim();
    case 'email': return !propValue.email?.trim();
    case 'phone_number': return !propValue.phone_number?.trim();
    case 'files':
      return !propValue.files || propValue.files.length === 0 || (!propValue.files[0]?.file?.url && !propValue.files[0]?.external?.url && !propValue.files[0]?.name);
    case 'created_by': case 'last_edited_by':
      const userObject = propValue[propValue.type];
      return !(userObject?.id);
    case 'created_time': case 'last_edited_time':
      return !(propValue[propValue.type]);
    case 'formula':
      const formula = propValue.formula;
      if (formula?.type === 'string') return !formula.string?.trim();
      if (formula?.type === 'number') return formula.number === null || formula.number === undefined;
      if (formula?.type === 'boolean') return formula.boolean === null || formula.boolean === undefined;
      if (formula?.type === 'date') return !formula.date?.start;
      return true;
    case 'unique_id':
      const uniqueId = propValue.unique_id;
      return !uniqueId?.number && uniqueId?.number !== 0;
    default: return false;
  }
};

// Helper to get a displayable value from a record for table previews
export const getDisplayValue = (
  record: any,
  columnKey: string,
  driverType?: StagedDataFormat['driver'],
  isTransformedPreview: boolean = false // Indicates if we're previewing post-transformation data
): string | null | JSX.Element => {
  let value: any;
  const isNotionSource = driverType === 'notion' || driverType === 'notion_template';
  const isSpinKitMongoSource = driverType === 'mongodb_spinkit';

  if (isSpinKitMongoSource && !isTransformedPreview && record && typeof record === 'object') {
    if (columnKey === 'id' && Object.prototype.hasOwnProperty.call(record, 'id')) {
      value = record.id;
    } else if (record.properties && typeof record.properties === 'object' && Object.prototype.hasOwnProperty.call(record.properties, columnKey)) {
      value = record.properties[columnKey];
    } else {
      return null; // Column not found in properties or as top-level id
    }
  } else if (isNotionSource && !isTransformedPreview && record?.properties?.[columnKey]) {
    const property = record.properties[columnKey];
    if (!property || !property.type || ['button', 'rollup', 'relation'].includes(String(property.type).toLowerCase())) return null;

    // Existing Notion property handling logic...
    switch (String(property.type).toLowerCase()) {
      case 'title': value = property.title?.[0]?.plain_text; break;
      case 'rich_text': value = property.rich_text?.[0]?.plain_text; break;
      case 'number': value = property.number; break;
      case 'select': value = property.select?.name; break;
      case 'multi_select': value = property.multi_select?.map((ms: any) => ms.name).join(', '); break;
      case 'status': value = property.status?.name; break;
      case 'date':
        let dateStr = property.date?.start ? new Date(property.date.start).toLocaleDateString() : '';
        if (property.date?.end && property.date.start !== property.date.end) dateStr += ` - ${new Date(property.date.end).toLocaleDateString()}`;
        value = dateStr;
        break;
      case 'checkbox': value = property.checkbox; break;
      case 'url': value = property.url; break;
      case 'email': value = property.email; break;
      case 'phone_number': value = property.phone_number; break;
      case 'files':
        value = (property.files?.length > 0)
          ? (property.files[0]?.file?.url || property.files[0]?.external?.url || property.files[0]?.name || '[File Present]')
          : null;
        break;
      case 'created_by': case 'last_edited_by':
        const userObj = property[property.type];
        value = userObj?.name || userObj?.id || '[User Object]';
        break;
      case 'created_time': case 'last_edited_time':
        value = property[property.type] ? new Date(property[property.type]).toLocaleString() : '';
        break;
      case 'formula':
        const fVal = property.formula;
        if (fVal?.type === 'string') value = fVal.string;
        else if (fVal?.type === 'number') value = fVal.number;
        else if (fVal?.type === 'boolean') value = fVal.boolean;
        else if (fVal?.type === 'date' && fVal.date?.start) value = new Date(fVal.date.start).toLocaleDateString();
        else value = '[Formula Result]';
        break;
      case 'unique_id':
        const uid = property.unique_id;
        value = `${uid?.prefix ? uid.prefix + '-' : ''}${uid?.number}`;
        break;
      default:
        const propContent = property[property.type];
        if (typeof propContent === 'object' && propContent !== null) {
          try { value = JSON.stringify(propContent).substring(0, 50) + (JSON.stringify(propContent).length > 50 ? '...' : ''); }
          catch { value = `[Object: ${property.type}]`; }
        } else if (propContent !== undefined && propContent !== null) {
          value = String(propContent);
        } else {
          value = null;
        }
        break;
    }
  } else if (record && typeof record === 'object' && Object.prototype.hasOwnProperty.call(record, columnKey)) {
    value = record[columnKey];
  } else {
    return null;
  }

  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />;
  
  const strVal = String(value).trim();
  if (strVal === '' || strVal.toLowerCase() === 'n/a') return null;

  return strVal.substring(0, 70) + (strVal.length > 70 ? '...' : '');
};

// Helper to transform a single source record based on column mappings for import
export const transformSingleRecord = (
  record: any,
  currentTableColMappings: Record<string, string>,
  newFieldTypesForTable: Record<string, string>,
  driverType?: StagedDataFormat['driver'],
  targetEntityKey?: keyof typeof TARGET_MONGO_FIELDS_MAP // Optional, for better new field naming
): Record<string, any> | null => {
  if (!record || typeof record !== 'object') return null;

  const transformedRecord: Record<string, any> = {};
  let hasAtLeastOneMappedField = false;
  const isNotionSource = driverType === 'notion' || driverType === 'notion_template';
  const isSpinKitMongoSource = driverType === 'mongodb_spinkit';

  Object.keys(currentTableColMappings).forEach(srcCol => {
    const targetFieldOrInstruction = currentTableColMappings[srcCol];
    if (!targetFieldOrInstruction || targetFieldOrInstruction === DO_NOT_IMPORT_VALUE) {
      return; // Skip this source column
    }

    let rawValue: any;

    if (isSpinKitMongoSource) {
      if (srcCol === 'id' && Object.prototype.hasOwnProperty.call(record, 'id')) {
        rawValue = record.id;
      } else if (record.properties && typeof record.properties === 'object' && Object.prototype.hasOwnProperty.call(record.properties, srcCol)) {
        rawValue = record.properties[srcCol];
      } else {
        rawValue = undefined; // Source column not found in properties or as top-level id
      }
    } else if (isNotionSource && record.properties?.[srcCol]) {
      const prop = record.properties[srcCol];
      // Existing Notion property extraction logic
      if (!prop || !prop.type || ['button', 'rollup', 'relation'].includes(String(prop.type).toLowerCase()) || isNotionPropertyEmpty(prop)) {
        rawValue = undefined;
      } else {
        switch (String(prop.type).toLowerCase()) {
          case 'title': rawValue = prop.title?.[0]?.plain_text; break;
          case 'rich_text': rawValue = prop.rich_text?.[0]?.plain_text; break;
          case 'number': rawValue = prop.number; break;
          case 'select': rawValue = prop.select?.name; break;
          case 'multi_select': rawValue = prop.multi_select?.map((ms: any) => ms.name); break; // Returns array
          case 'status': rawValue = prop.status?.name; break;
          case 'date': rawValue = prop.date?.start; break; // Store as ISO string
          case 'checkbox': rawValue = prop.checkbox; break;
          case 'url': rawValue = prop.url; break;
          case 'email': rawValue = prop.email; break;
          case 'phone_number': rawValue = prop.phone_number; break;
          case 'files': 
            rawValue = (prop.files?.length > 0) ? (prop.files[0]?.file?.url || prop.files[0]?.external?.url) : undefined;
            break;
          case 'created_time': case 'last_edited_time': rawValue = prop[prop.type]; break; 
          case 'created_by': case 'last_edited_by': rawValue = prop[prop.type]?.id; break; 
          case 'formula':
            const f = prop.formula;
            if (f?.type === 'string') rawValue = f.string;
            else if (f?.type === 'number') rawValue = f.number;
            else if (f?.type === 'boolean') rawValue = f.boolean;
            else if (f?.type === 'date' && f.date?.start) rawValue = f.date.start; 
            else rawValue = undefined;
            break;
          case 'unique_id':
            const uid = prop.unique_id;
            rawValue = `${uid?.prefix ? uid.prefix + '-' : ''}${uid?.number}`;
            break;
          default: 
            const propContent = prop[prop.type];
            rawValue = (typeof propContent !== 'object' || propContent === null) ? propContent : JSON.stringify(propContent);
            break;
        }
      }
    } else if (record && Object.prototype.hasOwnProperty.call(record, srcCol)) {
      // This handles flat JSON, or non-SpinKit MongoDB where driver might be just 'mongodb'
      rawValue = record[srcCol];
    } else {
      rawValue = undefined;
    }

    // Basic type coercion for "Yes"/"No" to boolean (remains the same)
    let valueToSet: any = rawValue;
    if (typeof rawValue === 'string') {
      const lowerVal = rawValue.toLowerCase();
      if (lowerVal === 'yes') valueToSet = true;
      else if (lowerVal === 'no') valueToSet = false;
    }
    
    // Default undefined to null for database insertion, unless it's a field explicitly being created
    if (valueToSet === undefined && targetFieldOrInstruction !== CREATE_NEW_FIELD_VALUE) {
      valueToSet = null;
    }


    let targetField = targetFieldOrInstruction;
    if (targetFieldOrInstruction === CREATE_NEW_FIELD_VALUE) {
      // Sanitize source column name to make it a valid field name
      const baseName = String(srcCol).trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/gi, '').toLowerCase();
      targetField = `${baseName}_new`;
      // Basic collision avoidance for new field names
      let suffix = 1;
      while (Object.prototype.hasOwnProperty.call(transformedRecord, targetField) || (targetEntityKey && TARGET_MONGO_FIELDS_MAP[targetEntityKey]?.includes(targetField))) {
        targetField = `${baseName}_new${suffix++}`;
      }
    }
    
    // Only set the field if there's a value or if it's a newly created field (which might be intentionally null/empty)
    if (valueToSet !== null || targetFieldOrInstruction === CREATE_NEW_FIELD_VALUE) {
      transformedRecord[targetField] = valueToSet;
      hasAtLeastOneMappedField = true;
    }
  });

  return hasAtLeastOneMappedField ? transformedRecord : null;
};

// Helper function to generate a single sample record for template download
export const generateSingleSampleRecord = (entityKey: keyof typeof TARGET_MONGO_FIELDS_MAP): any => {
  const sampleRecord: Record<string, string | number | boolean | string[] | null> = {};
  const fields = TARGET_MONGO_FIELDS_MAP[entityKey] || []; // Use TARGET_MONGO_FIELDS_MAP
  fields.forEach(field => {
    const fLower = String(field).toLowerCase();
    if (fLower.includes('id') || fLower === '_id') sampleRecord[String(field)] = `sample_${entityKey.toString()}_id_123`;
    else if (fLower.includes('name') || fLower === 'title') sampleRecord[String(field)] = `Sample ${getEntityTypeLabel(entityKey as any)} Name`;
    else if (fLower.includes('email')) sampleRecord[String(field)] = `sample@example.com`;
    else if (fLower.includes('url') || fLower.includes('link') || fLower.includes('imageurl') || fLower.includes('artworkurl')) sampleRecord[String(field)] = `https://example.com/sample-${field}.png`;
    else if (fLower.includes('date') || fLower.includes('time') || fLower === 'year') sampleRecord[String(field)] = new Date().toISOString().split('T')[0];
    else if (fLower.includes('score') || fLower.includes('rating') || fLower.includes('fanscore')) sampleRecord[String(field)] = 7.5; // Example number
    else if (fLower.includes('capacity') || fLower.includes('count') || fLower.includes('total') || fLower.includes('totalplays')) sampleRecord[String(field)] = 100; // Example number
    else if (fLower.startsWith('is') || fLower.startsWith('has') || fLower.includes('active')) sampleRecord[String(field)] = true;
    else if (fLower.includes('genres') || fLower.includes('tags') || fLower.includes('djneeds') || fLower.includes('soundsystem') || fLower.includes('specialties') || fLower.includes('typicaleventdays')) sampleRecord[String(field)] = ["Sample Tag 1", "Sample Tag 2"];
    else if (fLower.includes('bio') || fLower.includes('description')) sampleRecord[String(field)] = `This is a sample description for the ${getEntityTypeLabel(entityKey as any)}.`;
    else if (fLower.includes('location') || fLower.includes('city')) sampleRecord[String(field)] = "Sample City, Sample Country";
    else if (fLower.includes('recordings')) sampleRecord[String(field)] = [{ id: "rec_sample_1", title: "Sample Recording" } as any]; // Cast for simplicity
    else sampleRecord[String(field)] = `Sample value for ${field}`;
  });
  return sampleRecord;
};