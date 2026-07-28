export function valueFormatter(list, getter){
  return list
    .map(getter)
    .join(`\n`);
}

export const sorter = (field) => (a, b) => {
  if(a === b) return 0;
  if(!a[field]) return 1;
  if(!b[field]) return -1;
  return b[field] - a[field];
};
