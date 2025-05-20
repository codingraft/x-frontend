import { ChangeEvent, useEffect, useState } from "react";
import { FormDataEditProfile, User } from "../types/types";
import useUpdateUserProfile from "../hooks/useUpdateUserProfile";

const EditProfileModal = ({ authUser }: { authUser: User | null }) => {
  const [formData, setFormData] = useState<FormDataEditProfile>({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });

  const { updateProfile, isUpdating } = useUpdateUserProfile();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName,
        username: authUser.username,
        email: authUser.email,
        bio: authUser.bio || "",
        link: authUser.link || "",
        newPassword: "",
        currentPassword: "",
      });
    }
  }, [authUser]);
  // Only compare fields that exist in EditProfileFormData type
  const userFields: (keyof Pick<
    FormDataEditProfile,
    | "fullName"
    | "username"
    | "email"
    | "bio"
    | "link"
    | "newPassword"
    | "currentPassword"
  >)[] = [
    "fullName",
    "username",
    "email",
    "bio",
    "link",
    "newPassword",
    "currentPassword",
  ];
  const updatedFields = userFields.reduce((acc, key) => {
    if (formData[key] !== authUser?.[key]) {
      acc[key] = formData[key] ?? "";
    }
    return acc;
  }, {} as Record<"fullName" | "username" | "email" | "bio" | "link" | "newPassword" | "currentPassword", string>);

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          (
            document.getElementById("edit_profile_modal") as HTMLDialogElement
          ).showModal()
        }
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Profile updated successfully");
            }}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.fullName}
                name="fullName"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
                disabled
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="password"
                placeholder="Current Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.currentPassword}
                name="currentPassword"
                onChange={handleInputChange}
              />
              <input
                type="password"
                placeholder="New Password"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.newPassword}
                name="newPassword"
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />
            <button
              className="btn btn-primary rounded-full btn-sm text-white"
              onClick={(e) => {
                e.preventDefault();
                updateProfile(updatedFields);
              }}
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default EditProfileModal;
