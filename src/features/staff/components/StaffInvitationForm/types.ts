import type { StaffMemberRole } from "@/server/auth/type";

type StaffInvitationRoleOption = Readonly<{
  label: string;
  value: StaffMemberRole;
}>;

type StaffInvitationFormContent = Readonly<{
  connectedLater: string;
  emailError: string;
  emailLabel: string;
  emailPlaceholder: string;
  roleLabel: string;
  submitLabel: string;
  successMessage: string;
}>;

type StaffInvitationFormSubmitPayload = Readonly<{
  email: string;
  role: StaffMemberRole;
}>;

type StaffInvitationFormProps = Readonly<{
  content: StaffInvitationFormContent;
  onInvite?: (payload: StaffInvitationFormSubmitPayload) => void | Promise<void>;
  roleOptions: readonly StaffInvitationRoleOption[];
}>;

export type {
  StaffInvitationFormContent,
  StaffInvitationFormProps,
  StaffInvitationFormSubmitPayload,
  StaffInvitationRoleOption,
};
