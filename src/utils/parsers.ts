const parseProperty = (property: string | boolean): string => {
    return String(property).toLowerCase();
}

export default {
    parseProperty
};

export {
    parseProperty
};