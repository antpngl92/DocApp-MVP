"use client";

import { GlobalErrorState } from "@/components/feedback";

type ErrorPageProps = Readonly<{
  reset: () => void;
}>;

const ErrorPage = ({ reset }: ErrorPageProps) => {
  return <GlobalErrorState reset={reset} />;
};

export default ErrorPage;
