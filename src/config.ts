// Re-export of ConfigData in sea-map/index above seems not to work,
// so import it directly from here:
import { ConfigData } from  "mykomap/app/model/config-schema";

import type {
  CustomPropDef, FieldDefs
} from "mykomap/app/model/data-services";
import type {
  InitiativeObj
} from "mykomap/app/model/initiative";
import {
  mkObjTransformer,
  Transforms as T,
} from "mykomap/obj-transformer";
import * as versions from "./version.json";

import about from "../config/about.html";
import { getPopup } from './popup';

type Row = Record<string, string|null|undefined>;
const baseUri = 'https://dev.lod.coop/coops-uk/';

const rowToObj = mkObjTransformer<Row, InitiativeObj>({
  uri: T.prefixed(baseUri).from('Identifier'),
  name: T.text('').from('Name'),
  lat: T.nullable.number(null).from('Latitude'),
  lng: T.nullable.number(null).from('Longitude'),
  manLat: T.nullable.number(null).from('Geo Container Latitude'),
  manLng: T.nullable.number(null).from('Geo Container Longitude'),
  desc: T.text('').from('Description'),
  natureOfOrganisation: T.multi({of: T.text(''), omit: ['']}).from('Nature of Organisation'),
  orgStructure: T.multi({of: T.text(''), omit: ['']}).from('Organisational Structure'),
  primaryActivity: T.nullable.text(null).from('Primary Activity'),
  activity: T.multi({of: T.text(''), omit: ['']}).from('Activities'),
  combinedActivities: T.multi({of: T.text(''), omit: ['']}).from('Combined Activities'),
  street: T.text('').from('Street Address'),
  locality: T.text('').from('Locality'),
  postcode: T.text('').from('Postcode'),
  www: T.nullable.text(null).from('Website'),
  chNum: T.nullable.text(null).from('Companies House Number'),
  baseMembershipType: T.nullable.text(null).from('Membership Type'),
  within: T.nullable.text(null).from('Geo Container'),
});


const fields: FieldDefs = {
  desc: 'value',
  www: 'value',
  email: 'value',
  twitter: 'value',
  street: 'value',
  locality: 'value',    
  postcode: 'value',
  shortPostcode: {
    type: 'custom',
    builder: (id: string, def: CustomPropDef, params: InitiativeObj) => {
      // Regex adapted from here, combining UK and British Territories and Armed Forces
      // Will be null if there is no match.
      if (typeof params.postcode !== 'string')
        return undefined;
      const match = params
        .postcode
        .toUpperCase()
        .match(/^([A-Z][A-HJ-Y]?[0-9][A-Z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|GX\d{2}|PCRN|TKCA|BFPO)/);
      return match ? match[0] : undefined;
    },
  },
  natureOfOrganisation: {
    type: 'multi',
    of: {
      type: 'value',
    },
  },
  primaryActivity: {
    type: 'vocab',
    uri: 'am:',
    titleUri: 'ui:primaryActivity',
  },
  activities: {
    type: 'multi',
    from: 'activity',
    titleUri: 'ui:secondaryActivities',
    of: {
      type: 'vocab',
      uri: 'am:',
    },
  },
  combinedActivities: {
    type: 'multi',
    titleUri: 'ui:combinedActivities',
    of: {
      type: 'vocab',
      uri: 'am:',
    },
  },
  orgStructure: {
    type: 'multi',
    of: {
      type: 'vocab',
      uri: 'os:',
    },
  },
};

export const config: ConfigData = new ConfigData({
  namedDatasets: ['owned-by-oxford'],
  htmlTitle: 'Owned by Oxford',
  fields: fields,
  filterableFields: [
    'combinedActivities', 'primaryActivity', 'activities', 'orgStructure'
  ],
  searchedFields: [
    'name', 'street', 'locality', 'postcode', 'description', 'combinedActivities', 'orgStructure',
  ],
  languages: ['EN'],
  language: 'EN',
  vocabularies: [
    {
      id: 'obo-vocab',
      type: 'json',
      label: 'Owned By Oxford',
      url: 'https://dev.data.solidarityeconomy.coop/owned-by-oxford/vocabs.json',
    },
    {
      id: 'ui-vocab',
      type: 'json',
      label: 'Local Terms',
      url: 'obo.json',
    }
  ],
  dataSources: [
    {
      id: 'obo-public',
      label: 'Owned By Oxford',
      type: 'csv',
      url: 'https://dev.data.solidarityeconomy.coop/owned-by-oxford/standard.csv',
      transform: rowToObj,
    },
  ],
  defaultLatLng: [51.7520, -1.2577 ],
//  initialBounds: [[52.1006, -1.8787],[51.3966, -0.5974]],    
  defaultOpenSidebar: false,
  doesDirectoryHaveColours: true,
  maxZoomOnGroup:12,
  maxZoomOnOne: 14,
  maxZoomOnSearch: 12,
  showDatasetsPanel: false,
  customPopup: getPopup,
  aboutHtml: about,
  ...versions,
});
