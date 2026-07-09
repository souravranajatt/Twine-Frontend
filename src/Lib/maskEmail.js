export const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible_start = local.slice(0, 2);
  const visible_end = local.slice(-4);
  const masked = local.length > 6
    ? visible_start + "*".repeat(local.length - 6) + visible_end
    : visible_start + "*".repeat(Math.max(0, local.length - 2));
  return `${masked}@${domain}`;
};
