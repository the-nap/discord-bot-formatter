import { getSkillset } from "#utils/skillset.js"

export function createUserObject(user){
  return {
    name: user.username,
    damage: user.rankings?.weeklyUserDamages?.value ?? 0,
    skills: getSkillset(user)
  }
}

export function pcFormatter(data, columns){
  return columns.map(column => ({
    name: column.name,
    value: valueFormatter(data, column.getter),
    inline: true
  }))
}

export function mobileFormatter(data, columns){ 
  const lines = data.map(item =>
    `**${columns[0].getter(item)}**\n ${mobileValueFormatter(columns, item)}`
  );

  const fields = [];
  let current = '';

  for (const line of lines){
    if (current.length + line.length + (current ? 1 : 0) > 1024) {
      fields.push({
        name: fields.length === 0 ? 'Classifica' : '',
        value: current,
      });
      current = line;
    } else {
      current += (current ? '\n\n' : '') + line;
      }
    }
  if (current) {
    fields.push({
      name: fields.length === 0 ? 'Classifica' : '',
      value: current,
    });
  }
  return fields;
}

function mobileValueFormatter(columns, item){
  return columns
    .slice(1)
    .map(column => {
      const value = column.getter(item);
      return value === ''
      ? column.name
      : `${column.name}: **${value}**`
    })
    .join(`\n`)
}

export function valueFormatter(list, getter){
  if(list.length === 1)
    return list.map(getter).join('\n');

  return list
    .map((item,index) => {
      const value = getter(item);
      return value === ''
        ? `${String(index+1)})`
        : `${String(index+1)}) **${getter(item)}**`
    })

    .join(`\n`);
}

export const sorter = (field) => (a, b) => {
  if(a === b) return 0;
  if(!a[field]) return 1;
  if(!b[field]) return -1;
  return b[field] - a[field];
};

export function formatNumber(num) {
  const abs = Math.abs(num);

  if (abs >= 999_999) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  if (abs >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }

  return num.toLocaleString();
}
