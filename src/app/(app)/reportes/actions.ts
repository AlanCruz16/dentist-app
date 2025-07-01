"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function getNewPatientsPerMonth() {
    noStore();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_new_patients_per_month");

    if (error) {
        console.error("Error fetching new patients per month:", error);
        return [];
    }

    return data;
}

export async function getMonthlyRevenue() {
    noStore();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_monthly_revenue");

    if (error) {
        console.error("Error fetching monthly revenue:", error);
        return [];
    }

    return data;
}
