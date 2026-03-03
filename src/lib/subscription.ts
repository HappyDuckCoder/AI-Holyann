export type SubscriptionPlan = 'FREE' | 'PLUS' | 'ADVANCED' | 'PREMIUM';

export type SubscriptionFeature =
  | 'profileAnalysisDetail'
  | 'majorListCount'
  | 'majorFitShowCount'
  | 'classificationCount'
  | 'matchScoreDetail'
  | 'roadmapDetail'
  | 'enhanceCount'
  | 'cvAnalysisCount'
  | 'essayAnalysisCount'
  | 'essayMentor'
  | 'reportsCount';

type PlanConfig = Record<SubscriptionFeature, number | boolean>;

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanConfig> = {
  FREE: {
    profileAnalysisDetail: false,
    majorListCount: 3,
    majorFitShowCount: 1,
    classificationCount: 5, // 1 reach / 2 match / 2 safety
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
    majorListCount: 10,
    majorFitShowCount: 3,
    classificationCount: 9,
    matchScoreDetail: true,
    roadmapDetail: true,
    enhanceCount: 5,
    cvAnalysisCount: 5,
    essayAnalysisCount: 5,
    essayMentor: false,
    reportsCount: -1,
  },
  ADVANCED: {
    profileAnalysisDetail: true,
    majorListCount: 10,
    majorFitShowCount: 5,
    classificationCount: 9,
    matchScoreDetail: true,
    roadmapDetail: true,
    enhanceCount: 5,
    cvAnalysisCount: 5,
    essayAnalysisCount: 5,
    essayMentor: true,
    reportsCount: -1,
  },
  PREMIUM: {
    profileAnalysisDetail: true,
    majorListCount: 10,
    majorFitShowCount: 9,
    classificationCount: 9,
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

