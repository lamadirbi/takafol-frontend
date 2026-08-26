import CampProviders from '@/components/camp/CampProviders';

export default async function CampLayout({ children, params }) {
  const { campSlug } = await params;

  return <CampProviders campSlug={campSlug}>{children}</CampProviders>;
}
