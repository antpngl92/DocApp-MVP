import type { StaffInvitationRoleOption, StaffInvitationRoleValue } from "../../types";

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
  role: StaffInvitationRoleValue;
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
};
