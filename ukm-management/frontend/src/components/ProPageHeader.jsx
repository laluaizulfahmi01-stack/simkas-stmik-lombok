// src/components/ProPageHeader.jsx
// Reusable Influency-Style Pro Page Header
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MdSearch, MdNotificationsNone, MdKeyboardArrowDown, MdOutlineSettings } from "react-icons/md";

export default function ProPageHeader({ title, subtitle, pillBadge, pillColor = "indigo", actions, subbar, showSearch = true, onSearchClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pillMap = {
    indigo: { bg: "#e0e7ff", color: "#4338ca" },
    lime:   { bg: "#ecfccb", color: "#3f6212" },
    green:  { bg: "#dcfce7", color: "#15803d" },
    rose:   { bg: "#ffe4e6", color: "#be123c" },
    amber:  { bg: "#fef3c7", color: "#b45309" },
    sky:    { bg: "#e0f2fe", color: "#0369a1" },
    purple: { bg: "#ede9fe", color: "#6d28d9" },
  };
  const pill = pillMap[pillColor] || pillMap.indigo;
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";
  const goSettings = () => {
    if (user?.role === "superadmin") navigate("/admin/settings");
    else if (user?.role === "manager") navigate("/manager/settings");
    else navigate("/student/settings");
  };
  return (
    <>
      <div className="pro-header-bar">
        <div className="pro-header-title-block">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 className="pro-page-title">{title}</h1>
            {pillBadge && (
              <span className="pro-title-pill-badge" style={{ background: pill.bg, color: pill.color }}>
                {pillBadge}
              </span>
            )}
          </div>
          {subtitle && <p className="pro-page-subtitle">{subtitle}</p>}
        </div>
        <div className="pro-header-actions-block">
          {actions}
          {showSearch && (
            <div className="pro-circle-btn" title="Pencarian" onClick={onSearchClick} role="button">
              <MdSearch />
            </div>
          )}
          <div className="pro-circle-btn" title="Notifikasi" role="button">
            <MdNotificationsNone />
            <span className="pro-bell-dot" />
          </div>
          <div className="pro-circle-btn" title="Setelan Akun" onClick={goSettings} role="button">
            <MdOutlineSettings />
          </div>
          <div className="pro-user-pill" onClick={goSettings} role="button">
            <div className="pro-user-avatar" style={{
              background: user?.role === "superadmin" ? "#fde68a" : user?.role === "manager" ? "#d9f99d" : "#e0e7ff",
              color:      user?.role === "superadmin" ? "#92400e" : user?.role === "manager" ? "#365314" : "#4338ca",
            }}>
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}
            </div>
            <div className="pro-user-text">
              <span className="pro-user-welcome">
                {user?.role === "superadmin" ? "Super Admin" : user?.role === "manager" ? "Pengelola UKM" : "Mahasiswa"}
              </span>
              <span className="pro-user-name">{user?.name || "Pengguna"}</span>
            </div>
            <MdKeyboardArrowDown style={{ color: "var(--text-muted)", fontSize: 18 }} />
          </div>
        </div>
      </div>
      {subbar && <div className="pro-subbar">{subbar}</div>}
    </>
  );
}
