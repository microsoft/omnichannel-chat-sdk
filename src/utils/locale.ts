const localeList: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
  "1025": "ar-sa",
  "1026": "bg-bg",
  "1027": "ca-es",
  "1029": "cs-cz",
  "1030": "da-dk",
  "1031": "de-de",
  "1032": "el-gr",
  "1033": "en-us",
  "3082": "es-es",
  "1061": "et-ee",
  "1069": "eu-es",
  "1035": "fi-fi",
  "1036": "fr-fr",
  "1110": "gl-es",
  "1037": "he-il",
  "1081": "hi-in",
  "1050": "hr-hr",
  "1038": "hu-hu",
  "1057": "id-id",
  "1040": "it-it",
  "1041": "ja-jp",
  "1087": "kk-kz",
  "1042": "ko-kr",
  "1063": "lt-lt",
  "1062": "lv-lv",
  "1086": "ms-my",
  "1044": "nb-no",
  "1043": "nl-nl",
  "1045": "pl-pl",
  "1046": "pt-br",
  "2070": "pt-pt",
  "1048": "ro-ro",
  "1049": "ru-ru",
  "1051": "sk-sk",
  "1060": "sl-si",
  "3098": "sr-cyrl-cs",
  "2074": "sr-latn-cs",
  "1053": "sv-se",
  "1054": "th-th",
  "1055": "tr-tr",
  "1058": "uk-ua",
  "1066": "vi-vn",
  "2052": "zh-cn",
  "3076": "zh-hk",
  "1028": "zh-tw"
}

export const getLocaleStringFromId = (id: string): string => {
  const localeId = Object.keys(localeList).find(key => key === id);

  return localeId ? localeList[localeId] : defaultLocaleString;
}

export const getLocaleIdFromString = (value: string): string => {
  const localeId = Object.keys(localeList).find(key => localeList[key] === value);

  return localeId ?? defaultLocaleId;
}

export const defaultLocaleId = "1033";
export const defaultLocaleString = "en-us";