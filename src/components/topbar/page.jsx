"use client";
import "./page.css";
import { Search, Person, Chat, Notifications } from "@mui/icons-material";
import Link from 'next/link';
import { useUser } from "@clerk/nextjs"; // Zmieniono import na @clerk/nextjs

export default function Topbar() {
  const { user, isLoaded } = useUser();  // Dodano isLoaded dla lepszej obsługi stanu

  const renderUserSpecificContent = () => {
    if (!user) return null;

    switch (user.publicMetadata?.userType) {
      case 'Admin':
        return <Link href="/admin-panel" className="topbarLink">Admin Panel</Link>;
      case 'Teacher':
        return <Link href="/teacher-dashboard" className="topbarLink">Teacher Dashboard</Link>;
      case 'Student':
        return <Link href="/student-portal" className="topbarLink">Student Portal</Link>;
      case 'Parent':
        return <Link href="/parent-dashboard" className="topbarLink">Parent Dashboard</Link>;
      default:
        return null;
    }
  };

  // Obsługa stanu ładowania
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Obsługa braku zalogowania
  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="logo">Lamasocial</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for friend, post or video"
            className="searchInput"
          />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <Link href="/" className="topbarLink">Homepage</Link>
          <Link href="/timeline" className="topbarLink">Timeline</Link>
          {renderUserSpecificContent()}
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div className="topbarIconItem">
            <Notifications />
            <span className="topbarIconBadge">1</span>
          </div>
        </div>
        <Link href={`/profile/${user.username || user.id}`} className="topbarLink">
          Profile
        </Link>
      </div>
    </div>
  );
}