import { DataServices, propDefToVocabUri } from "mykomap/app/model/data-services";
import { Initiative } from "mykomap/app/model/initiative";
import { Vocab } from "mykomap/app/model/vocabs";
import { PhraseBook } from "mykomap/localisations";

function getAddress(initiative: Initiative, getTerm: (prop: string) => string, labels: PhraseBook) {
  // We want to add the whole address into a single para
  // Not all orgs have an address
  let address = "";
  let street;
  if (typeof initiative.street === 'string') {
    let streetArray = initiative.street.split(";");
    for (let partial of streetArray) {
      if (partial === initiative.name) continue;
      if (street) street += "<br/>";
      street = street ? (street += partial) : partial;
    }
    address += street;
  }
  if (initiative.locality) {
    address += (address.length ? "<br/>" : "") + initiative.locality;
  }
  if (initiative.region) {
    address += (address.length ? "<br/>" : "") + initiative.region;
  }
  if (initiative.postcode) {
    address += (address.length ? "<br/>" : "") + initiative.postcode;
  }
  if (initiative.countryId) {
    const countryName = getTerm('countryId');
    address += (address.length ? "<br/>" : "") + (countryName || initiative.countryId);
  }
  if (initiative.nongeo == 1 || !initiative.lat || !initiative.lng) {
    address += (address.length ? "<br/>" : "") + `<i>${labels.noLocation}</i>`;
  }
  if (address.length) {
    address = '<p class="sea-initiative-address">' + address + "</p>";
  }
  return address;
}

function getWww(initiative: Initiative) {
  // Initiative's website. Note, not all have a website.
  if (typeof initiative.www === 'string')
    return `<a href="${initiative.www}" target="_blank" >${initiative.www}</a>`;
  return '';
}

function vocabPropAsText(propTitle: string, propValue: unknown, vocab: Vocab, defaultTerm: string, unrecognised: string): string {
  const values: Array<unknown> = [];
  if (propValue instanceof Array && propValue.length > 0) {
    values.push(...propValue);
  }
  else if (propValue != null) {
    values.push(propValue);
  }
  const terms = values
    .filter(id => id != null)
    .sort()
    .map(id => vocab.terms[String(id)] ?? unrecognised);

  switch (terms.length) {
    case 0:
      return `${propTitle}: ${defaultTerm}`;
    case 1:
      return `<dt>${propTitle}</dt><dd>${terms[0]}</dd>`;
    default: 
      return `<dt>${propTitle}</dt><ul><li>${terms.join("<li>")}</ul>`;
  }
}

function getEmail(initiative: Initiative) {
  // Not all orgs have an email
  if (initiative.email)
    return `<a class="fa fa-envelope" href="mailto:${initiative.email}" target="_blank" ></a>`;
  return "";
}

function getFacebook(initiative: Initiative) {
  // not all have a facebook
  if (initiative.facebook)
    return `<a class="fab fa-facebook" href="https://facebook.com/${initiative.facebook}" target="_blank" ></a>`;
  return "";
}

function getTwitter(initiative: Initiative) {
  // not all have twitter
  if (initiative.twitter)
    return `<a class="fab fa-twitter" href="https://twitter.com/${initiative.twitter}" target="_blank" ></a>`;
  return '';
}

export function getPopup(initiative: Initiative, dataservices: DataServices) {
  const vocabs = dataservices.getVocabs();
  const lang = dataservices.getLanguage();
  const labels = dataservices.getFunctionalLabels();

  function getTerm(propertyName: string) {
    const propDef = dataservices.getPropertySchema(propertyName);
    const propVal = initiative[propertyName];
    const vocabUri = propDefToVocabUri(propDef);
    if (vocabUri) {
      if (typeof propVal === 'string')
        return vocabs.getTerm(propVal, lang);
      if (propVal === undefined)
        return labels.notAvailable;
      throw new Error(`invalid vocab property value for ${propertyName}: ${propVal}`);
    }
    throw new Error(`can't get term for non-vocab property ${propertyName}`);
  }

  // test unknown vals
  function vocabText(propName: string): string {
    const propDef = dataservices.getPropertySchema(propName);
    if (!propDef) throw new Error(`No such initiative property: ${propName}`);
    const vocabUri = propDefToVocabUri(propDef);
    if (!vocabUri) throw new Error(`Initiative property not a vocab URI: ${propName}`);
    const vocab = vocabs.getVocab(vocabUri, lang);
    let propTitle = vocab.title;
    if (propDef.titleUri)
      propTitle = vocabs.getTerm(propDef.titleUri, lang, vocab.title);
    return vocabPropAsText(propTitle, initiative[propName], vocab, labels.notAvailable, labels.notAvailable); // FIXME add unrecognisedTerm label, and warning trace
  }

  let popupHTML = `
    <div class="sea-initiative-details">
      <h2 class="sea-initiative-name">${initiative.name}</h2>
      <h4 class="sea-initiative-nature-of-organisation">${vocabText('natureOfOrganisation')}</h4>
      <h4 class="sea-initiative-org-structure">${vocabText('orgStructure')}</h4>
      <h4 class="sea-initiative-economic-activity">${vocabText('combinedActivities')}</h4>
      <p>${initiative.desc || ''}</p>
    </div>
    
    <div class="sea-initiative-contact">
      <h3>${labels.contact}</h3>
      <div class="sea-initiative-links">
        ${getEmail(initiative)}
        ${getFacebook(initiative)}
        ${getTwitter(initiative)}
      </div>
      ${getAddress(initiative, getTerm, labels)}
    </div>
  `;

  return popupHTML;
};

