import { notFound } from "next/navigation";

type ClinicOwnedRecord = {
  organizationId?: string | null;
};

type ClinicScopeCheckOptions<TRecord extends ClinicOwnedRecord> = {
  expectedOrganizationId: string;
  record: TRecord | null;
};

const recordBelongsToClinic = <TRecord extends ClinicOwnedRecord>(
  record: TRecord | null,
  expectedOrganizationId: string,
): record is TRecord & { organizationId: string } => {
  return Boolean(record?.organizationId && record.organizationId === expectedOrganizationId);
};

const hasClinicRecordAccess = <TRecord extends ClinicOwnedRecord>(
  options: ClinicScopeCheckOptions<TRecord>,
): boolean => {
  return recordBelongsToClinic(options.record, options.expectedOrganizationId);
};

const requireClinicRecordAccess = <TRecord extends ClinicOwnedRecord>(
  options: ClinicScopeCheckOptions<TRecord>,
): TRecord & { organizationId: string } => {
  if (!recordBelongsToClinic(options.record, options.expectedOrganizationId)) {
    notFound();
  }

  return options.record;
};

export { hasClinicRecordAccess, recordBelongsToClinic, requireClinicRecordAccess };
export type { ClinicOwnedRecord, ClinicScopeCheckOptions };
