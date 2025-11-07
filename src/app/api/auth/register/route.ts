import { NextRequest } from "next/server";
import { prismaRaw } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { apiHandler } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";
import { ConflictError } from "@/lib/errors";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const validatedData = registerSchema.parse(body);

  // Check if user already exists
  const existingUser = await prismaRaw.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser && !existingUser.deletedAt) {
    throw new ConflictError("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  // Create user
  const user = await prismaRaw.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return successResponse(
    { user, message: "User created successfully" },
    { status: 201 }
  );
});
