import { CampProvider } from '@/context/CampContext';

export default async function CampLayout({ children, params }) {
  const { campSlug } = await params;

  return (
    <CampProvider campSlug={campSlug}>
      {children}
    </CampProvider>
  );
}
