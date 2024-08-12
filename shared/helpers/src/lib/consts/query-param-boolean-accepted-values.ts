export const QUERY_PARAM_BOOLEAN_ACCEPTED_VALUES = [
  'true',
  'false',
  '0',
  '1',
] as const
export type QueryParamBooleanAcceptedValues =
  (typeof QUERY_PARAM_BOOLEAN_ACCEPTED_VALUES)[number]
export const QUERY_PARAM_BOOLEAN_TRUE_VALUES = ['true', '1'] as const
