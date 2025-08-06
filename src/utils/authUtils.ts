export default function hasAdminAccess(user: any): boolean {
  return ['admin', 'developer'].includes(user?.role);
}