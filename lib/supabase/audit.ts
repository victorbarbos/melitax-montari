import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is required."
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is required."
  );
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type AuditLogInput = {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(
  data: AuditLogInput
) {
  const { error } =
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: data.userId,
        action: data.action,
        entity_type: data.entityType,
        entity_id:
          data.entityId || null,
        entity_name:
          data.entityName || null,
        old_data:
          data.oldData || null,
        new_data:
          data.newData || null,
        ip_address:
          data.ipAddress || null,
        user_agent:
          data.userAgent || null,
      });

  if (error) {
    console.error(
      "AUDIT LOG ERROR:",
      error
    );

    throw error;
  }
}