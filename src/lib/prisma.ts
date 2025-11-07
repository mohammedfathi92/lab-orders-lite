import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create base Prisma client
const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Extend Prisma client with soft delete support
export const prisma = prismaClient.$extends({
  query: {
    // Soft delete models
    user: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        if (result?.deletedAt) return null;
        return result;
      },
      async delete({ args, query }) {
        return prismaClient.user.update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany({ args, query }) {
        return prismaClient.user.updateMany({
          where: { ...args.where, deletedAt: null },
          data: { deletedAt: new Date() },
        });
      },
    },
    patient: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        if (result?.deletedAt) return null;
        return result;
      },
      async delete({ args, query }) {
        return prismaClient.patient.update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany({ args, query }) {
        return prismaClient.patient.updateMany({
          where: { ...args.where, deletedAt: null },
          data: { deletedAt: new Date() },
        });
      },
    },
    test: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        if (result?.deletedAt) return null;
        return result;
      },
      async delete({ args, query }) {
        return prismaClient.test.update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany({ args, query }) {
        return prismaClient.test.updateMany({
          where: { ...args.where, deletedAt: null },
          data: { deletedAt: new Date() },
        });
      },
    },
    order: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        const result = await query(args);
        if (result?.deletedAt) return null;
        return result;
      },
      async delete({ args, query }) {
        return prismaClient.order.update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },
      async deleteMany({ args, query }) {
        return prismaClient.order.updateMany({
          where: { ...args.where, deletedAt: null },
          data: { deletedAt: new Date() },
        });
      },
    },
  },
});

// Export raw client for cases where you need to access deleted records
export const prismaRaw = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

