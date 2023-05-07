import { DataServices } from "mykomap/src/map-app/app/model/data-services";
import { Initiative } from "mykomap/src/map-app/app/model/initiative";
import { Vocab } from "mykomap/src/map-app/app/model/vocabs";
import { PhraseBook } from "mykomap/src/map-app/localisations";

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

function getOrgStructure(initiative: Initiative, osVocab: Vocab) {

  if (initiative.orgStructure instanceof Array && initiative.orgStructure.length > 0) {
    const term = initiative.orgStructure.map(id => osVocab.terms[String(id)]).join(", ");    
    return `${osVocab.title}: ${term}`;
  }

  return '';
}

function getPrimaryActivity(initiative: Initiative, acVocab: Vocab) {
  if (typeof initiative.primaryActivity === 'string' && initiative.primaryActivity != "") {
    return `Main Activity: ${acVocab.terms[initiative.primaryActivity]}`;
  }

  return '';
}

function getSecondaryActivities(initiative: Initiative, acVocab: Vocab, labels: PhraseBook) {
  const title = labels.secondaryActivities;

  if (initiative.activities instanceof Array && initiative.activities.length > 0) {
    const term = initiative.activities.map(id => acVocab.terms[String(id)]).join(", ");
    return `${title}: ${term}`;
  }

  return '';
}

function getCombinedActivities(initiative: Initiative, acVocab: Vocab) {
  const title = 'Activites'; //  HACK - should be localised (except we are catering for EN only)

  if (initiative.combinedActivities instanceof Array && initiative.combinedActivities.length > 0) {
    const term = initiative.combinedActivities.map(id => acVocab.terms[String(id)]).join(", ");
    return `${title}: ${term}`;
  }

  return '';
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

export function getPopup(initiative: Initiative, sse_initiatives: DataServices) {
  const getTerm = sse_initiatives.getVocabs().getTerm;
  const values = sse_initiatives.getLocalisedVocabs();
  const labels = sse_initiatives.getFunctionalLabels();
  const activtiesUri = "am:";
  const orgStructUri = "os:";
  let popupHTML = `
    <div class="sea-initiative-details">
      <h2 class="sea-initiative-name">${initiative.name}</h2>
      ${getWww(initiative)}
      <h4 class="sea-initiative-org-structure">${getOrgStructure(initiative, values[orgStructUri])}</h4>
      <h4 class="sea-initiative-economic-activity">${getPrimaryActivity(initiative, values[activtiesUri])}</h4>
      <h4 class="sea-initiative-secondary-activity">${getSecondaryActivities(initiative, values[activtiesUri], labels)}</h5>
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
