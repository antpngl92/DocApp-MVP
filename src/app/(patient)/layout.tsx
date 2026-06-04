import { PatientShell } from "@/components/layout";

type PatientLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const PatientLayout = ({ children }: PatientLayoutProps) => {
  return <PatientShell>{children}</PatientShell>;
};

export default PatientLayout;
