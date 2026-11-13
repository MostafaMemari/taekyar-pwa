const FORM_ROUTES = [
  /^\/coach\/students\/new$/,
  /^\/coach\/students\/invite$/,
  /^\/coach\/students\/[^/]+\/(?:edit|belt)$/,
  /^\/coach\/profile\/edit$/,
  /^\/coach\/sessions\/[^/]+\/attendance$/,
];

export function isCoachFormRoute(pathname: string) {
  return FORM_ROUTES.some((route) => route.test(pathname));
}
