export function arrayToObjectByKey(key: string, array: Array<any>) {
  return array.reduce<Record<any, typeof array[any]>>((obj, item) => {
    obj[`${item[key]}`] = item;
    return obj;
  }, {});
}