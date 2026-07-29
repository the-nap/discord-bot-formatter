import { getSkillset } from "#utils/skillset.js"

export function createUserObject(user){
  return {
    name: user.username,
    damage: user.rankings?.weeklyUserDamages?.value ?? 0,
    skills: getSkillset(user)
  }
}

export function pcFormatter(data, columns){
  return columns.map({
    name: columns.title,
    value: valueFormatter(data, columns.getter),
    inline: true
  })
}

export function mobileFormatter(data, columns){ 
  return data.map(item => ({
    name: columns[0].getter(item),
    value: mobileValueFormatter(columns)
  }))
}

function mobileValueFormatter(columns){
  return columns
    .slice(1)
    .map(column => `*${column.name}** ${col.getter(item)}`)
    .join(`\n`)
}

export function valueFormatter(list, getter){
  if(list.length === 1)
    return list.map(getter).join('\n');

  return list
    .map((item,index) =>
      `${String(index+1)}) **${getter(item)}**`)
    .join(`\n`);
}


export const sorter = (field) => (a, b) => {
  if(a === b) return 0;
  if(!a[field]) return 1;
  if(!b[field]) return -1;
  return b[field] - a[field];
};
