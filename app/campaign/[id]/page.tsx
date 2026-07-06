import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import FlashCampaignSection from "@/components/FlashCampaignSection";

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const { data: campaign } = await supabase
    .from("flash_campaigns")
    .select("*, campaign_bank_accounts(*)")
    .eq("id", params.id)
    .single();

  if (!campaign) notFound();

  return (
    <main className="min-h-screen bg-[#FAF7F0]">
      <FlashCampaignSection campaign={campaign} />
    </main>
  );
}