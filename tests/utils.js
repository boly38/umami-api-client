export const isSet = (value) => value !== null && value !== undefined;
export const logStringifyOf = val => {
    console.info(JSON.stringify(val, null, 2));
}