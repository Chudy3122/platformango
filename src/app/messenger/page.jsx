'use client';

import dynamic from 'next/dynamic';

const MessengerContent = dynamic(() => import('./Messenger'), { 
  ssr: false 
});

export default function MessengerPage() {
  return <MessengerContent />;
}