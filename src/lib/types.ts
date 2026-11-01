export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "lecturer" | "superadmin";
  status: "active" | "suspended";
  institution: string | null;
  bio: string | null;
  fieldOfStudy: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRecord {
  id: number;
  userId: number;
  plan: "free" | "premium";
  status: "active" | "canceled" | "expired";
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteRecord {
  id: number;
  title: string;
  description: string;
  semester: string | null;
  academicYear: string | null;
  resourceType: string;
  isPremium: boolean;
  fileName: string;
  fileSize: number;
  fileMime: string;
  status: "pending" | "approved" | "rejected" | "removed";
  rejectionReason: string | null;
  downloadsCount: number;
  viewsCount: number;
  ratingSum: number;
  ratingCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  uploaderId: number;
  uploaderName: string | null;
  institutionId: number | null;
  institutionName: string | null;
  fieldId: number | null;
  fieldName: string | null;
  levelId: number | null;
  levelName: string | null;
  unitId: number | null;
  unitName: string | null;
  uploaderBio?: string | null;
  uploaderInstitution?: string | null;
}

export interface AcademicStructure {
  institutions: { id: number; name: string; active: boolean }[];
  fields: { id: number; name: string; active: boolean }[];
  levels: { id: number; name: string; active: boolean }[];
  units: { id: number; name: string; fieldId: number | null; levelId: number | null; active: boolean }[];
}
