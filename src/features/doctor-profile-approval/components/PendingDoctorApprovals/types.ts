import type { PendingDoctorApprovalRecord } from "@/server/auth/type";

type PendingDoctorApprovalsContent = Readonly<{
  approveLabel: string;
  createdLabel: string;
  emailLabel: string;
  emptyDescription: string;
  emptyTitle: string;
  heading: string;
  phoneFallback: string;
  phoneLabel: string;
  specialtyFallback: string;
  specialtyLabel: string;
}>;

type PendingDoctorApprovalsProps = Readonly<{
  content: PendingDoctorApprovalsContent;
  doctors: readonly PendingDoctorApprovalRecord[];
  onApprove: (doctorId: string) => Promise<void>;
}>;

export type { PendingDoctorApprovalsContent, PendingDoctorApprovalsProps };
