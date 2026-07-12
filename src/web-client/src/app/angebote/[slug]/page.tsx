import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOfferBySlug, offers } from '@/lib/mockData';
import { OfferDetailClient } from './OfferDetailClient';

export function generateStaticParams() {
  return offers.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const offer = getOfferBySlug(slug);
  if (!offer) return {};
  return {
    title: offer.title,
    description: offer.shortDescription,
  };
}

export default async function OfferDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const offer = getOfferBySlug(slug);
  if (!offer) notFound();

  return <OfferDetailClient offer={offer} />;
}
