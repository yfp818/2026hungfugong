import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FlashCampaignSection from "@/components/FlashCampaignSection";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("flash_campaigns")
    .select("*, campaign_bank_accounts(*)")
    .eq("id", resolvedParams.id)
    .single();

  if (!campaign) notFound();

  return (
    <main className="min-h-screen bg-background">
      <FlashCampaignSection campaign={campaign} />
    </main>
  );
}