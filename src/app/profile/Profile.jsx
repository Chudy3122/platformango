'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import "./profile.css";
import Topbar from "../../components/topbar/page";
import Sidebar from "../../components/Sidebar";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export default function Profile() {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState({});
  const params = useParams();
  const username = params?.username;

  useEffect(() => {
    const fetchUser = async () => {
      if (!username) return;
      
      try {
        const res = await axios.get(`/api/users?username=${username}`);
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUser();
  }, [username]);

  if (typeof window === 'undefined' || !isLoaded) {
    return <div>Ładowanie...</div>;
  }

  if (!clerkUser) {
    return <div>Nie jesteś zalogowany</div>;
  }

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <Image
                className="profileCoverImg"
                src={user.coverPicture || '/images/person/noCover.png'}
                alt="Cover"
                width={1024}
                height={300}
                priority
              />
              <Image
                className="profileUserImg"
                src={user.profilePicture || '/images/person/noAvatar.png'}
                alt="Profile"
                width={150}
                height={150}
                priority
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username || clerkUser.username}</h4>
              <span className="profileInfoDesc">{user.desc || 'Brak opisu'}</span>
            </div>
          </div>
          <div className="profileRightBottom">
            {/* Miejsce na dodatkowe komponenty */}
          </div>
        </div>
      </div>
    </>
  );
}