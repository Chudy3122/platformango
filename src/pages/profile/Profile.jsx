// src/pages/profile/Profile.jsx
"use client";

import "./profile.css";
import Topbar from '@/components/topbar/page';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";  // zmienione z react-router

export default function Profile() {
  const PF = process.env.NEXT_PUBLIC_PUBLIC_FOLDER;
  const [user, setUser] = useState({});
  const params = useParams();  // zmienione z useParams z react-router
  const username = params?.username;

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users?username=${username}`);
      setUser(res.data);
    };
    fetchUser();
  }, [username]);

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
                    ? PF + user.coverPicture
                    : PF + "person/noCover.png"
                }
                alt=""
              />
              <img
                className="profileUserImg"
                src={
                  user.profilePicture
                    ? PF + user.profilePicture
                    : PF + "person/noAvatar.png"
                }
                alt=""
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username}</h4>
              <span className="profileInfoDesc">{user.desc}</span>
            </div>
          </div>
          {/* Usunęliśmy sekcję profileRightBottom z Feed i Rightbar */}
        </div>
      </div>
    </>
  );
}