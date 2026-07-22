import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";

export default async function getCompanyData(link, id){
  const client = createAPIClient();

  const [companyRequest, workOffersRequest] = await Promise.allSettled([
    client.company.getById({ companyId: id }),
    client.workOffer.getWorkOfferByCompanyId({ companyId: id }),
  ]);

  const company = companyRequest.value;

  let offers = '';
  let requisites = '';
  let workers;
  if ( workOffersRequest.status === 'fulfilled' ) {
    const workOffers = workOffersRequest.value;
    offers = `${workOffers.quantity} offerte disponibili a ${workOffers.wage} (${workOffers.wageAfterTax})`;
    if ( workOffers.minLevel )
      requisites += `Livello: ${workOffers.minLevel}+\n`
    if ( workOffers.minEnergy )
      requisites += `Energia: ${workOffers.minEnergy}+\n`
    if ( workOffers.minProduction )
      requisites += `Produzione: ${workOffers.minProduction}+\n`
  }
  if(offers === ''){
    offers = 'Nessun offerta di lavoro';
  }
  if(requisites === '')
      requisites = 'Nessun requisito richiesto';
  if(company.workerCount === 1){
    workers = `1 dipendente`;
  } else {
    workers = `${company.workerCount} dipendenti`;
  }
  
  const embed = new EmbedBuilder()
    .setTitle(company.name)
    .setURL(link)
    .setThumbnail(`https://app.warera.io/images/map/${company.itemCode}.png?v=21`)
    .addFields(
      { name: 'Dipendenti', value: workers },
      { name: 'Offerte', value: offers },
      { name: 'Requisiti', value: requisites }
    );

  return ['', embed];

}
