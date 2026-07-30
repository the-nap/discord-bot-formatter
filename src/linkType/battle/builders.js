import { formatNumber, mobileFormatter, pcFormatter, sorter } from '#utils/formatter.js';

export function buildScore({ data, battle }){

  const left = battle.type === "tournament"
    ? `Team ${data.defender.number}`
    : data.defender.name;

  const right = battle.type === "tournament"
    ? `Team ${data.attacker.number}`
    : data.attacker.name;

  const icon = battle.type === "resistance" ? "✊" : "⚔️";

  return toField('',`${left} 🛡️  ${battle.defender.wonRoundsCount} : ${battle.attacker.wonRoundsCount}  ${icon} ${right}`);
}

export function buildTitle({ data, battle }){
  return battle.type === "tournament"
    ? `Turno ${battle.tournamentRoundNumber}`
    : data.region.name;

}

export function buildRoundCount({ battle, battleDetails }){
  return toField('',
    !battle.isActive
      ? "La battaglia è terminata"
      : `⚔️ LIVE • Round ${battleDetails.battle.roundIds.length}`
  );
}

export function buildMuBattleData({ muDamage }){
  if(muDamage && Object.keys(muDamage).length){
    const [muData] = Object.values(muDamage);
    return [{ 
      name: ``,
      value: `${muData.name}`,
      inline: true
    },
    {
      name: `💥 Danni`,
      value: `${formatNumber(muData.damage)}`,
      inline: true
    },
    {
      name: '🏆 Rank',
      value: `${muData.rank}`,
      inline: true
    },
    { name: '\u200b', value: '\u200b', inline: false },
    ]
  }
  return [];
}

export function buildMembersBattleData({ rankings }){
  if(rankings){
    const sortedMembers = Object.values(rankings).sort(sorter('damage'));
    const columns = [
      {
        name: '👤 Player',
        getter: m => m.name,
      },
      {
        name: '💥 Danni',
        getter: m => formatNumber(m.damage),
      },
      {
        name: '🏆 Rank',
        getter: m => m.rank
      }
    ]
    return { data: sortedMembers, columns: columns };
  }
  return {};
}

function toField(name, value, inline = false){
  return {
    name: name,
    value: value,
    inline: inline
  }
}
