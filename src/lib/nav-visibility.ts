const HIDDEN_PATHS = ['/login', '/registrieren', '/upgrade']
const HIDDEN_PREFIXES = ['/admin', '/auth']

export function isBottomNavHidden(pathname: string): boolean {
  return HIDDEN_PATHS.includes(pathname) || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
