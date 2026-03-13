// import dbConnect from "@/lib/mongoose";
// import { User } from "@/models/UserSchema";
// import Job from "@/models/JobSchema";
// import Proposal from "@/models/ProposalSchema";
// import Contract from "@/models/ContractSchema";

export type AdminSocialMedia = Record<
  string,
  {
    username?: string;
    followers?: string | number;
  }
>;

export type AdminUserSummary = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
  location?: string | null;
  companyName?: string | null;
  industry?: string | null;
  businessPhone?: string | null;
  verified?: boolean;
  businessVerified?: boolean;
  onboarded?: boolean;
  banned?: boolean;
  banReason?: string | null;
  banExpiresAt?: string;
  socialMedia?: AdminSocialMedia;
  createdAt?: string;
};

export type AdminProposalSummary = {
  id: string;
  status?: string;
  message?: string;
  createdAt?: string;
  influencer?: AdminUserSummary;
};

export type AdminContractSummary = {
  id: string;
  status?: string;
  price?: number;
  deadline?: string;
  influencerConfirmed?: boolean;
  ownerConfirmed?: boolean;
  senderProposalId?: string;
  receiverProposalId?: string;
  senderInfluencer?: AdminUserSummary;
  receiverInfluencer?: AdminUserSummary;
  createdAt?: string;
};

export type AdminJobSummary = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  status?: string;
  createdAt?: string;
  postedBy?: AdminUserSummary;
  proposals: AdminProposalSummary[];
  contracts: AdminContractSummary[];
};

export type AdminBusinessOwnerSummary = AdminUserSummary & {
  jobs: AdminJobSummary[];
};

export type AdminOverview = {
  users: AdminUserSummary[];
  businessOwners: AdminBusinessOwnerSummary[];
  jobs: AdminJobSummary[];
  totals: {
    users: number;
    businessOwners: number;
    jobs: number;
    proposals: number;
    contracts: number;
  };
};

function safeIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function parseSocialMedia(value: unknown): AdminSocialMedia | undefined {
  if (!value) return undefined;
  if (typeof value === "object") return value as AdminSocialMedia;
  if (typeof value !== "string") return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object") return parsed as AdminSocialMedia;
    return undefined;
  } catch {
    return undefined;
  }
}

function toUserSummary(doc: any): AdminUserSummary {
  if (!doc) return { id: "" };

  const rawBanExpires =
    doc.banExpiresAt ?? doc.banExpires ?? doc.banExpiresOn ?? doc.banUntil;

  return {
    id: String(doc._id ?? doc.id ?? ""),
    name: doc.name ?? null,
    email: doc.email ?? null,
    role: doc.role ?? null,
    image: doc.image ?? null,
    location: doc.location ?? null,
    companyName: doc.companyName ?? null,
    industry: doc.industry ?? null,
    businessPhone: doc.businessPhone ?? null,
    verified: doc.verified,
    businessVerified: doc.businessVerified,
    onboarded: doc.onboarded,
    banned:
      typeof doc.banned === "boolean"
        ? doc.banned
        : typeof doc.isBanned === "boolean"
          ? doc.isBanned
          : undefined,
    banReason: doc.banReason ?? null,
    banExpiresAt: safeIsoDate(rawBanExpires),
    socialMedia: parseSocialMedia(doc.socialMedia),
    createdAt: safeIsoDate(doc.createdAt),
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const dbConnect = (await import("@/lib/mongoose")).default;
  const { User } = await import("@/models/UserSchema");
  const Job = (await import("@/models/JobSchema")).default;
  const Proposal = (await import("@/models/ProposalSchema")).default;
  const Contract = (await import("@/models/ContractSchema")).default;
  await dbConnect();

  const usersRaw = await User.find({}).lean();

  const jobsRaw = await Job.find({})
    .populate({
      path: "postedBy",
      select:
        "name email role image location companyName industry businessPhone verified businessVerified onboarded socialMedia createdAt",
      model: User,
    })
    .sort({ createdAt: -1 })
    .lean();

  const jobIds = jobsRaw.map((j: any) => String(j._id));

  const proposalsRaw = await Proposal.find({
    ...(jobIds.length ? { jobId: { $in: jobIds } } : {}),
  })
    .populate({
      path: "influencerId",
      select:
        "name email role image location companyName industry businessPhone verified businessVerified onboarded socialMedia createdAt",
      model: User,
    })
    .sort({ createdAt: -1 })
    .lean();

  const proposalsByJobId = new Map<string, any[]>();
  for (const p of proposalsRaw) {
    const jobId = String((p as any).jobId);
    const list = proposalsByJobId.get(jobId) ?? [];
    list.push(p);
    proposalsByJobId.set(jobId, list);
  }

  const contractsRaw = await Contract.find({})
    .populate({
      path: "senderId",
      model: "Proposal",
      populate: [
        {
          path: "jobId",
          model: "Job",
          select: "_id",
        },
        {
          path: "influencerId",
          model: User,
          select:
            "name email role image location companyName industry businessPhone verified businessVerified onboarded socialMedia createdAt",
        },
      ],
    })
    .populate({
      path: "reciverId",
      model: "Proposal",
      populate: [
        {
          path: "jobId",
          model: "Job",
          select: "_id",
        },
        {
          path: "influencerId",
          model: User,
          select:
            "name email role image location companyName industry businessPhone verified businessVerified onboarded socialMedia createdAt",
        },
      ],
    })
    .sort({ createdAt: -1 })
    .lean();

  const contractsByJobId = new Map<string, any[]>();
  for (const c of contractsRaw) {
    const senderJobId = (c as any).senderId?.jobId
      ? String((c as any).senderId.jobId._id ?? (c as any).senderId.jobId)
      : undefined;
    const receiverJobId = (c as any).reciverId?.jobId
      ? String((c as any).reciverId.jobId._id ?? (c as any).reciverId.jobId)
      : undefined;

    for (const jobId of [senderJobId, receiverJobId]) {
      if (!jobId) continue;
      const list = contractsByJobId.get(jobId) ?? [];
      list.push(c);
      contractsByJobId.set(jobId, list);
    }
  }

  const jobs: AdminJobSummary[] = jobsRaw.map((job: any) => {
    const jid = String(job._id);

    const proposals: AdminProposalSummary[] = (
      proposalsByJobId.get(jid) ?? []
    ).map((p: any) => ({
      id: String(p._id),
      status: p.status,
      message: p.message,
      createdAt: safeIsoDate(p.createdAt),
      influencer: toUserSummary(p.influencerId),
    }));

    const contracts: AdminContractSummary[] = (
      contractsByJobId.get(jid) ?? []
    ).map((c: any) => ({
      id: String(c._id),
      status: c.status,
      price: c.price,
      deadline: safeIsoDate(c.deadline),
      influencerConfirmed: c.influencerConfirmed,
      ownerConfirmed: c.ownerConfirmed,
      senderProposalId: c.senderId?._id ? String(c.senderId._id) : undefined,
      receiverProposalId: c.reciverId?._id
        ? String(c.reciverId._id)
        : undefined,
      senderInfluencer: toUserSummary(c.senderId?.influencerId),
      receiverInfluencer: toUserSummary(c.reciverId?.influencerId),
      createdAt: safeIsoDate(c.createdAt),
    }));

    return {
      id: jid,
      title: job.title,
      description: job.description,
      price: job.price,
      status: job.status,
      createdAt: safeIsoDate(job.createdAt),
      postedBy: toUserSummary(job.postedBy),
      proposals,
      contracts,
    };
  });

  const users: AdminUserSummary[] = usersRaw.map((u: any) => toUserSummary(u));

  const jobsByOwnerId = new Map<string, AdminJobSummary[]>();
  for (const j of jobs) {
    const ownerId = j.postedBy?.id;
    if (!ownerId) continue;
    const list = jobsByOwnerId.get(ownerId) ?? [];
    list.push(j);
    jobsByOwnerId.set(ownerId, list);
  }

  const businessOwners: AdminBusinessOwnerSummary[] = users
    .filter((u) => u.role === "business")
    .map((owner) => ({
      ...owner,
      jobs: jobsByOwnerId.get(owner.id) ?? [],
    }))
    .sort((a, b) => (b.jobs?.length ?? 0) - (a.jobs?.length ?? 0));

  return {
    users,
    businessOwners,
    jobs,
    totals: {
      users: users.length,
      businessOwners: businessOwners.length,
      jobs: jobs.length,
      proposals: proposalsRaw.length,
      contracts: contractsRaw.length,
    },
  };
}
