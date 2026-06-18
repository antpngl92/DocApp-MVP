type DoctorProfileOnboardingFormContent = Readonly<{
  emailHelp: string;
  emailLabel: string;
  nameError: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  serverError: string;
  specialtyLabel: string;
  specialtyPlaceholder: string;
  submitLabel: string;
  successMessage: string;
}>;

type DoctorProfileOnboardingFormSubmitPayload = Readonly<{
  name: string;
  phone: string | null;
  specialty: string | null;
}>;

type DoctorProfileOnboardingFormProps = Readonly<{
  content: DoctorProfileOnboardingFormContent;
  email: string;
  initialName: string;
  onSubmit?: (payload: DoctorProfileOnboardingFormSubmitPayload) => Promise<void>;
}>;

export type {
  DoctorProfileOnboardingFormContent,
  DoctorProfileOnboardingFormProps,
  DoctorProfileOnboardingFormSubmitPayload,
};
