import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  content: ["create", "edit", "delete", "publish"],
  business: ["manage", "analytics", "billing"],
} as const;

export const ac = createAccessControl(statement);

export const influencer = ac.newRole({
  content: ["create", "edit", "publish"],
});

export const business = ac.newRole({
  business: ["manage", "analytics", "billing"],
  content: ["create"],
});

export const admin = ac.newRole({
  content: ["create", "edit", "delete", "publish"],
  business: ["manage", "analytics", "billing"],
});
