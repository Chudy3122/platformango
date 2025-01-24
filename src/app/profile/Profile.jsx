'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import "./profile.css";
import Topbar from "../../components/topbar/page";
import Sidebar from "../../components/Sidebar";

export default function Profile() {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState({});
  const params = useParams();
  const username = params?.username;

  useEffect(() => {
    const fetchUser = async () => {
      if (!username) return;
      
      try {
        const res = await axios.get(`/users?username=${username}`);
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUser();
  }, [username]);

  if (!isLoaded) {
    return <div>Ładowanie...</div>;
  }

  if (!clerkUser) {
    return <div>Nie jesteś zalogowany</div>;
  }

  const PF = process.env.NEXT_PUBLIC_PUBLIC_FOLDER;

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img
                className="profileCoverImg"
                src={
                  user.coverPicture
                    ? `${PF}${user.coverPicture}`
                    : `${PF}person/noCover.png`
                }
                alt=""
              />
              <img
                className="profileUserImg"
                src={
                  user.profilePicture
                    ? `${PF}${user.profilePicture}`
                    : `${PF}person/noAvatar.png`
                }
                alt=""
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username}</h4>
              <span className="profileInfoDesc">{user.desc}</span>
            </div>
          </div>
          <div className="profileRightBottom">
            {/* Usuń komponenty Feed i Rightbar */}
          </div>
        </div>
      </div>
    </>
  );
}