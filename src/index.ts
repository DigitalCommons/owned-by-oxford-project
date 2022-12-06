import { webRun, fetchConfigs} from "sea-map/index";

// Re-export of ConfigData in sea-map/index above seems not to work,
// so import it directly from here:
import type { ConfigData } from  "sea-map/app/model/config_schema";
import type {
  Initiative, DataServices, CustomPropDef, InitiativeObj
} from "sea-map/app/model/dataservices";
import { getAddress, getEmail, getTwitter } from "sea-map/app/view/map/default_popup";
import * as versions from "./version.json";

import about from "../config/about.html";
import { getPopup } from './popup.js';

const config: ConfigData = {
  namedDatasets: ['owned-by-oxford'],
  htmlTitle: 'Owned by Oxford',
  fields: {
    desc: 'value',
    www: 'value',
    twitter: 'value',
    street: 'value',
    locality: 'value',    
    postcode: 'value',
    shortPostcode: {
      type: 'custom',
      builder: (id: string, def: CustomPropDef, params: InitiativeObj) => {
        // Regex adapted from here, combining UK and British Territories and Armed Forces
        // Will be null if there is no match.
        if (params.postcode == null)
          return undefined;
        const match = params
          .postcode
          .toUpperCase()
          .match(/^([A-Z][A-HJ-Y]?[0-9][A-Z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|GX\d{2}|PCRN|TKCA|BFPO)/);
        return match ? match[0] : undefined;
      },
    },
    primaryActivity: {
      type: 'vocab',
      uri: 'aci:',
    },
    activities: {
      type: 'multi',
      of: {
        type: 'vocab',
        uri: 'aci:',
        from: 'activity',
      },
    },
    relationship: {
      type: 'multi',
      of: {
        type: 'value',
      },
    },
  },
  filterableFields: [
    'primaryActivity', 'activities', 'shortPostcode'
  ],
  searchedFields: [
    'name', 'street', 'locality', 'postcode', 'description'
  ],
  languages: ['EN'],
  language: 'EN',
  vocabularies: [
    { endpoint: 'http:\/\/dev.data.solidarityeconomy.coop:8890/sparql',
      defaultGraphUri: 'https://dev.lod.coop/owned-by-oxford',
      uris: {
        'https:\/\/dev.lod.coop/essglobal/2.1/standard/activities-modified/': 'aci'
      }
    }
  ],
  defaultLatLng: [51.7520, -1.2577 ],
//  initialBounds: [[52.1006, -1.8787],[51.3966, -0.5974]],    
  defaultOpenSidebar: false,
  doesDirectoryHaveColours: true,
  maxZoomOnGroup:12,
  maxZoomOnOne: 14,
  maxZoomOnSearch: 12,
  customPopup: getPopup,
  aboutHtml: about,
  ...versions,
};

webRun(window, config);
