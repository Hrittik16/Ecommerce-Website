import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { password } = deleteAccountSchema.parse(body);

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify password
    const bcrypt = require("bcryptjs");
    const isValid = await bcrypt.compare(password, user.password!);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }

    // Delete user and all associated data
    await prisma.$transaction([
      // Delete cart items
      prisma.cartItem.deleteMany({
        where: { cart: { userId: user.id } },
      }),
      // Delete cart
      prisma.cart.deleteMany({
        where: { userId: user.id },
      }),
      // Delete wishlist items
      prisma.wishlistItem.deleteMany({
        where: { wishlist: { userId: user.id } },
      }),
      // Delete wishlist
      prisma.wishlist.deleteMany({
        where: { userId: user.id },
      }),
      // Delete addresses
      prisma.address.deleteMany({
        where: { userId: user.id },
      }),
      // Delete orders
      prisma.order.deleteMany({
        where: { userId: user.id },
      }),
      // Delete user
      prisma.user.delete({
        where: { id: user.id },
      }),
    ]);

    return NextResponse.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 