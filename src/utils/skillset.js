export function isInWar(skills){
  if(skills.attack.level >= 3 && skills.precision.level >= 3 && skills.energy.level < 2 && skills.production.level < 2)
      return true;
    return false;
}

export function getSkillset(user){
  if(user.leveling.level < 20)
    return "🌱 Cresce"
  const lvl = skill => user.skills[skill]?.level ?? 0;

  let partialWar = false;
  if(lvl('attack') > 0 ||
    lvl('precision') > 0 ||
    lvl('criticalChance') > 0)
      partialWar = true;
    
  if(lvl('energy') > 2 ||
    lvl('production') > 2){
    if(partialWar) 
      return '🔀 Ibrido';
    return '💰 Eco';
  }
  return '⚔️ War';
}
