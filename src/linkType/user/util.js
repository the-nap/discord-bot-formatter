import { getSkillset } from "#utils/skillset.js"

export function createUserObject(user){
  return {
    name: user.username,
    damage: user.rankings?.weeklyUserDamages?.value ?? 0,
    skills: getSkillset(user)
  }
}
