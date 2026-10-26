const FORM_ROUTES = [
  /^\/coach\/students\/new$/,
  /^\/coach\/students\/invite$/,
  /^\/coach\/students\/[^/]+\/(?:edit|belt)$/,
  /^\/coach\/clubs\/new$/,
  /^\/coach\/clubs\/[^/]+\/edit$/,
  /^\/coach\/sessions\/new$/,
  /^\/coach\/sessions\/[^/]+\/(?:edit|attendance)$/,
];

export function isCoachFormRoute(pathname: string) {
  return FORM_ROUTES.some((route) => route.test(pathname));
}
