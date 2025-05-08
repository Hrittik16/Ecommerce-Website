"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PersonalInformationForm } from "./components/personal-information-form";
import { AddressManagement } from "./components/address-management";
import { OrderHistory } from "./components/order-history";
import { AccountSettings } from "./components/account-settings";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <Card className="p-6">
            <PersonalInformationForm />
          </Card>
        </TabsContent>
        <TabsContent value="addresses">
          <Card className="p-6">
            <AddressManagement />
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card className="p-6">
            <OrderHistory />
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card className="p-6">
            <AccountSettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 