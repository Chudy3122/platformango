'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const Menu = dynamic(() => import('./Menu'), {
  ssr: false
});

export default function MenuWrapper() {
  const params = useParams();
  const lang = params?.lang || 'pl';
  
  return <Menu lang={lang as string} />;
}