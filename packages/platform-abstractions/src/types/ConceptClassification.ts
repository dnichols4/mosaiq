export interface ConceptClassification {
  conceptId: string;
  confidence: number;
  classifiedAt: string; // ISO date string
  userVerified?: boolean;
  // Add any other fields if they were previously part of a local definition elsewhere
}
