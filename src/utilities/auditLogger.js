// utilities/auditLogger.js
import AuditLog from "../models/auditlog.js";

export const logAudit = async ({
  user,
  action,
  entity,
  entityId,
  taxYear,
  req,
  metadata = {},
}) => {
  await AuditLog.create({
    user,
    action,
    entity,
    entityId,
    taxYear,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    metadata,
  });
};
