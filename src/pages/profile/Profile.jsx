'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import "./profile.css";
import Topbar from "../../components/topbar/page";
import Sidebar from "../../components/Sidebar";

export default function Profile() {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const username = params?.username;

  const fetchUser = useCallback(async () => {
    if (!username || !clerkUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/users?username=${username}`);
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Nie udało się pobrać danych użytkownika");
    } finally {
      setLoading(false);
    }
  }, [username, clerkUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Early returns dla różnych stanów
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isLoaded || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Ładowanie...</div>
      </div>
    );
  }

  if (!clerkUser) {
    return (
      <div className="error-container">
        <div className="error-message">Nie jesteś zalogowany</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const defaultImageProps = {
    width: 0,
    height: 0,
    sizes: "100vw",
    style: { width: '100%', height: 'auto' }
  };

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <div className="coverImageContainer">
                <Image
                  className="profileCoverImg"
                  src={
                    user?.coverPicture
                      ? `/api/images/${user.coverPicture}`
                      : '/images/person/noCover.png'
                  }
                  alt="Cover"
                  priority
                  {...defaultImageProps}
                />
              </div>
              <div className="profileImageContainer">
                <Image
                  className="profileUserImg"
                  src={
                    user?.profilePicture
                      ? `/api/images/${user.profilePicture}`
                      : '/images/person/noAvatar.png'
                  }
                  alt="Profile"
                  width={150}
                  height={150}
                  priority
                />
              </div>
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">
                {user?.username || clerkUser.username || 'Użytkownik'}
              </h4>
              <span className="profileInfoDesc">
                {user?.desc || 'Brak opisu'}
              </span>
            </div>
          </div>
          <div className="profileRightBottom">
            {/* Możesz dodać tutaj dodatkowe komponenty jak Feed czy Rightbar */}
          </div>
        </div>
      </div>
    </>
  );
}
