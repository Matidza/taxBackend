await logAudit({
  user: req.user.id,
  action: "UPLOAD_DOCUMENT",
  entity: "UserTaxDocument",
  entityId: document._id,
  taxYear: req.body.taxYear,
  req,
});
