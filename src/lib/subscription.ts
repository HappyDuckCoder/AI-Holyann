export type SubscriptionPlan = 'FREE' | 'PLUS' | 'ADVANCED' | 'PREMIUM';

/** Plans shown on pricing page (ADVANCED kept for backward compatibility only). */
export const DISPLAY_PLANS: SubscriptionPlan[] = ['FREE', 'PLUS', 'PREMIUM'];

export type SubscriptionFeature =
  | 'profileAnalysisDetail'
  | 'profileAnalysisLimit'
  | 'profileEnhanceLimit'
  | 'majorListCount'
  | 'majorFitShowCount'
  | 'classificationCount'
  | 'classificationAttemptsLimit'
  | 'matchScoreDetail'
  | 'roadmapDetail'
  | 'enhanceCount'
  | 'cvAnalysisCount'
  | 'essayAnalysisCount'
  | 'essayMentor'
  | 'reportsCount';

type PlanConfig = Record<SubscriptionFeature, number | boolean>;

/** Plus Feature 3: 15 attempts per month (exception to 6‑month cycle). */
export const PLUS_CLASSIFICATION_PERIOD_MONTHLY = true;

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanConfig> = {
  FREE: {
    profileAnalysisDetail: false,
    profileAnalysisLimit: 1,
    profileEnhanceLimit: 1,
    majorListCount: 3,
    majorFitShowCount: 1,
    classificationCount: 5,
    classificationAttemptsLimit: 1,
    matchScoreDetail: false,
    roadmapDetail: false,
    enhanceCount: 1,
    cvAnalysisCount: 1,
    essayAnalysisCount: 1,
    essayMentor: false,
    reportsCount: 1,
  },
  PLUS: {
    profileAnalysisDetail: true,
    profileAnalysisLimit: 5,
    profileEnhanceLimit: 5,
    majorListCount: 15,
    majorFitShowCount: 15,
    classificationCount: 30,
    classificationAttemptsLimit: 15,
    matchScoreDetail: true,
    roadmapDetail: true,
    enhanceCount: 10,
    cvAnalysisCount: 10,
    essayAnalysisCount: 10,
    essayMentor: false,
    reportsCount: -1,
  },
  ADVANCED: {
    profileAnalysisDetail: true,
    profileAnalysisLimit: -1,
    profileEnhanceLimit: -1,
    majorListCount: 15,
    majorFitShowCount: 15,
    classificationCount: 30,
    classificationAttemptsLimit: -1,
    matchScoreDetail: true,
    roadmapDetail: true,
    enhanceCount: -1,
    cvAnalysisCount: -1,
    essayAnalysisCount: -1,
    essayMentor: true,
    reportsCount: -1,
  },
  PREMIUM: {
    profileAnalysisDetail: true,
    profileAnalysisLimit: -1,
    profileEnhanceLimit: -1,
    majorListCount: 15,
    majorFitShowCount: 15,
    classificationCount: 30,
    classificationAttemptsLimit: -1,
    matchScoreDetail: true,
    roadmapDetail: true,
    enhanceCount: -1,
    cvAnalysisCount: -1,
    essayAnalysisCount: -1,
    essayMentor: true,
    reportsCount: -1,
  },
};

export function canAccess(plan: SubscriptionPlan, feature: SubscriptionFeature): boolean {
  const value = PLAN_LIMITS[plan][feature];
  if (typeof value === 'boolean') {
    return value;
  }
  // numeric: any non-zero limit means feature exists; -1 is unlimited
  return value !== 0;
}

export function getLimit(plan: SubscriptionPlan, feature: SubscriptionFeature): number | boolean {
  return PLAN_LIMITS[plan][feature];
}

export function hasQuota(
  plan: SubscriptionPlan,
  feature: SubscriptionFeature,
  usedCount: number | null | undefined
): boolean {
  const value = PLAN_LIMITS[plan][feature];

  if (typeof value === 'boolean') {
    // boolean-valued features do not use counters
    return value;
  }

  if (value === -1) {
    return true;
  }

  const used = typeof usedCount === 'number' && usedCount >= 0 ? usedCount : 0;
  return used < value;
}

