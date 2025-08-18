export function getBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3000';
  try {
    // validate
    return new URL('/', base).origin;
  } catch {
    return 'http://localhost:3000';
  }
}
