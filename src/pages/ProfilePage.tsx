import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";



type Profile = {
  name: string;
  role: "SEEKER" | "EMPLOYER";

  seekerProfile: {
    bio: string | null;
    skills: string[];
  } | null;

  employerProfile: {
    companyName: string;
    companyWebsite: string | null;
    companyDescription: string | null;
  } | null;
};

type ProfileResponse = {
  data: Profile;
};
type SaveSeekerResponse = {
  data: {
    bio: string | null;
    skills: string[];
  };
};
type SaveEmployerResponse = {
  data: {
    companyName: string;
    companyWebsite: string | null;
    companyDescription: string | null;
  };
};
function ProfilePage() {
   const { token } = useAuth();
     const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [bio, setBio] = useState("");
const [skillsText, setSkillsText] = useState("");
const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState("");
const [success, setSuccess] = useState("");
const [companyName, setCompanyName] = useState("");
const [companyWebsite, setCompanyWebsite] = useState("");
const [companyDescription, setCompanyDescription] = useState("");
const [savingEmployer, setSavingEmployer] = useState(false);
const [employerError, setEmployerError] = useState("");
const [employerSuccess, setEmployerSuccess] = useState("");

  useEffect(() => {
  const controller = new AbortController();

  async function loadProfile() {
    try {
      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/profiles/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const result: ProfileResponse = await response.json();

      if (!controller.signal.aborted) {
  setProfile(result.data);

  const seeker = result.data.seekerProfile;

  if (seeker) {
    setBio(seeker.bio ?? "");
    setSkillsText(seeker.skills.join(", "));
  }

  const employer = result.data.employerProfile;

setCompanyName(employer?.companyName ?? "");
setCompanyWebsite(employer?.companyWebsite ?? "");
setCompanyDescription(employer?.companyDescription ?? "");
}
    } catch {
      if (!controller.signal.aborted) {
        setError("Could not load your profile.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  void loadProfile();

  return () => {
    controller.abort();
  };
}, [token]);

async function handleSave(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setSaveError("");
  setSuccess("");

  if (!token || profile?.role !== "SEEKER") {
    setSaveError("Could not verify your account.");
    return;
  }

  const cleanBio = bio.trim();

  const skills = skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);

  if (skills.length === 0) {
    setSaveError("Please add at least one skill.");
    return;
  }

  if (cleanBio.length > 1000) {
    setSaveError("Bio must not exceed 1000 characters.");
    return;
  }

  if (profile.seekerProfile?.bio && !cleanBio) {
    setSaveError("Clearing an existing bio is not supported yet.");
    return;
  }

  setSaving(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profiles/seeker/me`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skills,
          ...(cleanBio ? { bio: cleanBio } : {}),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save profile");
    }

    const result: SaveSeekerResponse = await response.json();

    setProfile((prev) =>
      prev
        ? { ...prev, seekerProfile: result.data }
        : prev
    );

    setBio(result.data.bio ?? "");
    setSkillsText(result.data.skills.join(", "));
    setSuccess("Profile saved successfully!");
  } catch {
    setSaveError("Could not save your profile.");
  } finally {
    setSaving(false);
  }
}
async function handleSaveEmployer(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setEmployerError("");
  setEmployerSuccess("");

  if (!token || profile?.role !== "EMPLOYER") {
    setEmployerError("Could not verify your account.");
    return;
  }

  const cleanName = companyName.trim();
  const cleanWebsite = companyWebsite.trim();
  const cleanDescription = companyDescription.trim();

  if (cleanName.length < 2 || cleanName.length > 100) {
    setEmployerError(
      "Company name must be between 2 and 100 characters."
    );
    return;
  }

  if (cleanDescription.length > 2000) {
    setEmployerError(
      "Company description must not exceed 2000 characters."
    );
    return;
  }

  if (
    (profile.employerProfile?.companyWebsite && !cleanWebsite) ||
    (profile.employerProfile?.companyDescription && !cleanDescription)
  ) {
    setEmployerError(
      "Clearing existing optional fields is not supported yet."
    );
    return;
  }

  setSavingEmployer(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profiles/employer/me`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: cleanName,
          ...(cleanWebsite
            ? { companyWebsite: cleanWebsite }
            : {}),
          ...(cleanDescription
            ? { companyDescription: cleanDescription }
            : {}),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save employer profile");
    }

    const result: SaveEmployerResponse = await response.json();

    setProfile((prev) =>
      prev
        ? { ...prev, employerProfile: result.data }
        : prev
    );

    setCompanyName(result.data.companyName);
    setCompanyWebsite(result.data.companyWebsite ?? "");
    setCompanyDescription(result.data.companyDescription ?? "");

    setEmployerSuccess("Company profile saved successfully!");
  } catch {
    setEmployerError("Could not save company profile.");
  } finally {
    setSavingEmployer(false);
  }
}
 return (
  <section className="profile-page">
    <h1>My Profile</h1>

    {loading ? (
     <p role="status">Loading profile...</p>
    ) : error ? (
      <p role="alert">{error}</p>
    ) : !profile ? (
      <p>Profile not found.</p>
    ) : (
      <>
        <h2>{profile.name}</h2>
        <p>Role: {profile.role}</p>

        {profile.role === "SEEKER" ? (
     <form className="profile-form" onSubmit={handleSave}>
  {!profile.seekerProfile && (
    <p>You have not created your seeker profile yet.</p>
  )}

  <div>
    <label htmlFor="seeker-bio">Bio</label>
    <textarea
      id="seeker-bio"
      value={bio}
      onChange={(event) => setBio(event.target.value)}
    />
  </div>

  <div>
    <label htmlFor="seeker-skills">Skills</label>
    <input
      id="seeker-skills"
      type="text"
      value={skillsText}
      onChange={(event) => setSkillsText(event.target.value)}
      placeholder="React, TypeScript, Node.js"
    />
  </div>
  <button type="submit" disabled={saving}>
  {saving ? "Saving..." : "Save Profile"}
</button>

{saveError && <p role="alert">{saveError}</p>}
{success && <p role="status">{success}</p>}
</form>
) : (
  <form className="profile-form" onSubmit={handleSaveEmployer}>
    {!profile.employerProfile && (
      <p>You have not created your employer profile yet.</p>
    )}

    <div>
      <label htmlFor="company-name">Company Name</label>
      <input
        id="company-name"
        type="text"
        value={companyName}
        onChange={(event) => setCompanyName(event.target.value)}
      />
    </div>

    <div>
      <label htmlFor="company-website">Company Website</label>
      <input
        id="company-website"
        type="url"
        value={companyWebsite}
        onChange={(event) => setCompanyWebsite(event.target.value)}
      />
    </div>

    <div>
      <label htmlFor="company-description">
        Company Description
      </label>
      <textarea
        id="company-description"
        value={companyDescription}
        onChange={(event) =>
          setCompanyDescription(event.target.value)
        }
      />
    </div>
    <button type="submit" disabled={savingEmployer}>
  {savingEmployer ? "Saving..." : "Save Company Profile"}
</button>

{employerError && <p role="alert">{employerError}</p>}
{employerSuccess && <p role="status">{employerSuccess}</p>}
  </form>
)}
      </>
    )}

    <Link className="back-link" to="/account">Back to Account</Link>
  </section>
);
}

export default ProfilePage;