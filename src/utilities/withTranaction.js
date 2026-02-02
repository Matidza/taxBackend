import mongoose from "mongoose";

export const withTransaction = (handler) => {
  return async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      req.mongoSession = session;

      await handler(req, res);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };
};
