import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scheduleSchema, themeSchema, colorSchema } from "./custom-schedule";
import type { Json } from "@/integrations/supabase/types";

export const getAccount = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [profile, schedules] = await Promise.all([
    context.supabase.from("profiles").select("*").eq("id", context.userId).single(),
    context.supabase.from("schedules").select("*").eq("user_id", context.userId).order("updated_at", { ascending: false }),
  ]);
  if (profile.error) throw new Error(profile.error.message);
  if (schedules.error) throw new Error(schedules.error.message);
  return { profile: profile.data, schedules: schedules.data };
});
export const saveSchedule = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid().optional(), document: scheduleSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const values = { title: data.document.title, document: data.document as unknown as Json, updated_at: new Date().toISOString() };
    const result = data.id
      ? await context.supabase.from("schedules").update(values).eq("id", data.id).eq("user_id", context.userId).select("id").single()
      : await context.supabase.from("schedules").insert({ ...values, user_id: context.userId }).select("id").single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });
export const deleteSchedule = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("schedules").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
export const updateProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ displayName: z.string().trim().max(80), avatarPath: z.string().nullable(), theme: themeSchema, color: colorSchema }).parse(input))
  .handler(async ({ data, context }) => {
    if (data.avatarPath && !data.avatarPath.startsWith(`${context.userId}/`)) throw new Error("Invalid profile photo.");
    const { error } = await context.supabase.from("profiles").update({ display_name: data.displayName, avatar_path: data.avatarPath, preferences: { theme: data.theme, color: data.color }, updated_at: new Date().toISOString() }).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
export const deleteAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  // Privileged deletion is limited to the identity already verified by middleware.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const files = await supabaseAdmin.storage.from("avatars").list(context.userId, { limit: 1000 });
  if (files.error) throw new Error(files.error.message);
  if (files.data.length) {
    const removed = await supabaseAdmin.storage.from("avatars").remove(files.data.map((f) => `${context.userId}/${f.name}`));
    if (removed.error) throw new Error(removed.error.message);
  }
  const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
  if (error) throw new Error(error.message);
  return { success: true };
});