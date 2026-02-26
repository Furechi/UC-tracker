import { supabase } from "./supabase";

const KEY_RECORDS = "records";
const KEY_MEDICATIONS = "medications";

export async function loadRecords(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from("app_data")
    .select("value")
    .eq("key", KEY_RECORDS)
    .single();

  if (error || !data) return {};
  return data.value;
}

export async function saveRecords(records: Record<string, any>) {
  await supabase.from("app_data").upsert([
    {
      key: KEY_RECORDS,
      value: records,
    },
  ]);
}

export async function loadMedications(): Promise<any[]> {
  const { data, error } = await supabase
    .from("app_data")
    .select("value")
    .eq("key", KEY_MEDICATIONS)
    .single();

  if (error || !data) return [];
  return data.value;
}

export async function saveMedications(medications: any[]) {
  await supabase.from("app_data").upsert([
    {
      key: KEY_MEDICATIONS,
      value: medications,
    },
  ]);
}
