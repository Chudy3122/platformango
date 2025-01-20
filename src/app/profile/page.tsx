'use client';

import dynamic from 'next/dynamic';

// Dynamiczny import wyłączający SSR
const Profile = dynamic(() => import('./Profile'), { 
  ssr: false 
});

export default function ProfilePage() {
  return <Profile />;
}