export function isInWar(skills){
  if(skills.attack.level >= 3 && skills.precision.level >= 3 && skills.energy.level < 2 && skills.production.level < 2)
      return true;
    return false;
}

export function getSkillset(user){
  if(user.leveling.level < 20)
    return "🌱 Livellando..."
  const lvl = skill => user.skills[skill].level;

  let partialWar = false;
  if(lvl('attack') > 0 && 
    lvl('precision') > 0 && 
    lvl('criticalChance') > 0 &&
    lvl('criticalDamage') > 0 &&
    lvl('armor' > 0) &&
    lvl('dodge' > 0))
      partialWar = true;
    
  if(lvl('energy') > 2 &&
    lvl('production') > 2){
    if(partialWar) 
      return '🔀 Ibrido';
    return '💰 Eco';
  }
  return '⚔️ War';
}
