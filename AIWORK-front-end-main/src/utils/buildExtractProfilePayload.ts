import {
  ExtractProfileInput,
  VALUE_ENUM_MAP,
  REVENUE_ENUM_MAP,
  RELATIONSHIP_ENUM_MAP,
} from "@/services/onboarding/extractProfile";

interface Question {
  slug: string;
  question: string;
  answer: string;
}

/**
 * Maps core-values answer string (e.g. "Family, Deep Work, Strategic Impact")
 * to enum array ["FAMILY", "DEEP_WORK", "STRATEGIC_IMPACT"]
 */
function mapValuesToEnum(answer: string): string[] {
  if (!answer) return [];
  return answer
    .split(",")
    .map((v) => v.trim().toLowerCase().replace(/\s+/g, "_"))
    .map((key) => VALUE_ENUM_MAP[key])
    .filter(Boolean);
}

/**
 * Maps client-revenue answer (e.g. "Under $3k", "$3k - $7k")
 * to enum like "UNDER_3K"
 */
function mapRevenueToEnum(answer: string): string {
  const normalized = answer.toLowerCase().replace(/[\s$\-]/g, "");
  for (const [key, value] of Object.entries(REVENUE_ENUM_MAP)) {
    if (normalized.includes(key.replace(/_/g, ""))) return value;
  }
  // Fallback: try matching by label patterns
  if (normalized.includes("under")) return "UNDER_3K";
  if (normalized.includes("12k") || normalized.includes("12k+")) return "K12_PLUS";
  if (normalized.includes("7k")) return "K7_TO_12K";
  if (normalized.includes("3k")) return "K3_TO_7K";
  return "UNDER_3K";
}

/**
 * Maps client-health answer (e.g. "Thriving", "Under Pressure")
 * to enum like "THRIVING"
 */
function mapRelationshipToEnum(answer: string): string {
  const normalized = answer.toLowerCase().replace(/\s+/g, "_");
  return RELATIONSHIP_ENUM_MAP[normalized] || "STABLE";
}

export function buildExtractProfilePayload(
  questions: Question[]
): ExtractProfileInput {
  const findBySlug = (slug: string) =>
    questions.find((q) => q.slug === slug)?.answer || "";

  const clientName = findBySlug("top-client");
  const revenueAnswer = findBySlug("client-revenue");
  const healthAnswer = findBySlug("client-health");
  const valuesAnswer = findBySlug("core-values");

  return {
    questions: questions.map(({ question, answer }) => ({ question, answer })),
    client: {
      name: clientName,
      revenueRange: mapRevenueToEnum(revenueAnswer),
      relationshipState: mapRelationshipToEnum(healthAnswer),
    },
    values: mapValuesToEnum(valuesAnswer),
  };
}
