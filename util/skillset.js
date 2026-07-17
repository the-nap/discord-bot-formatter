export function isInWar(skills){
  if(skills.attack.level > 3 && skills.precision.level > 3 && skills.energy.level < 2 && skills.production.level < 3)
      return true;
    return false;
}
