'use client';

import dynamic from 'next/dynamic';

// Dynamiczny import wyłączający SSR
const Messenger = dynamic(() => import('./Messenger'), { 
  ssr: false 
});

export default function MessengerPage() {
  return <Messenger />;
}