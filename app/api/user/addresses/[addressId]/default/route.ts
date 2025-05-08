import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: params.addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    // Reset all addresses to non-default
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    // Set the selected address as default
    const updatedAddress = await prisma.address.update({
      where: { id: params.addressId },
      data: { isDefault: true },
    });

    return NextResponse.json({
      message: "Default address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 