import { createClient } from "@supabase/supabase-js";
import { Order, OrderStatus } from "../types.ts";

const SUPABASE_URL = "https://ikdlhrrjingkrddwbmuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_LKjR1Q0Lqf_ygoBuJVoumg_zr5IHLDG";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const storageService = {
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("getOrders error:", error);
      return [];
    }

    return (data || []).map((o: any) => ({
      id: o.id,
      pickupNumber: o.pickup_number,
      status: o.status as OrderStatus,
      updatedAt: o.updated_at,
      createdAt: o.created_at || o.updated_at, // Fallback for old records
    }));
  },

  async addOrder(pickupNumber: string): Promise<void> {
    const { error } = await supabase.from("orders").insert({
      pickup_number: pickupNumber,
      status: OrderStatus.REPAIRING,
      updated_at: Date.now(),
      created_at: Date.now(),
    });

    if (error) console.error("addOrder error:", error);
  },

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: Date.now() })
      .eq("id", id);

    if (error) console.error("updateStatus error:", error);
  },

  async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) console.error("deleteOrder error:", error);
  },

  // New function for archiving/resetting instead of deleting
  async archiveAllOrders(): Promise<void> {
    // Fetch all non-archived orders
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .neq('status', OrderStatus.ARCHIVED);

    if (!orders || orders.length === 0) return;

    const ids = orders.map(o => o.id);

    // Update them to ARCHIVED
    const { error } = await supabase
      .from("orders")
      .update({ status: OrderStatus.ARCHIVED, updated_at: Date.now() })
      .in('id', ids);

    if (error) console.error("archiveAllOrders error:", error);
  }
};
