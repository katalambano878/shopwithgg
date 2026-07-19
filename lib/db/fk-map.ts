// Foreign-key map for PostgREST-style embeds in supabase-compat.
// Generated from shopwithgg schema SQL (Jul 2026). Keyed by the table that OWNS the FK column.

export interface FkEdge {
  column: string;
  foreignTable: string;
  foreignColumn: string;
}

export const JSONB_COLUMNS: Record<string, Set<string>> = {
  profiles: new Set(["preferences"]),
  roles: new Set(["permissions"]),
  addresses: new Set(["metadata"]),
  store_settings: new Set(["value"]),
  site_settings: new Set(["value"]),
  audit_logs: new Set(["details"]),
  categories: new Set(["metadata"]),
  products: new Set(["options", "metadata"]),
  product_variants: new Set(["metadata"]),
  coupons: new Set(["metadata"]),
  orders: new Set(["shipping_address", "billing_address", "metadata"]),
  order_items: new Set(["metadata"]),
  notifications: new Set(["data"]),
  cms_content: new Set(["metadata"]),
  customers: new Set(["default_address"]),
  chat_conversations: new Set(["messages", "metadata"]),
  customer_insights: new Set(["preferences", "ai_notes"]),
  support_tickets: new Set(["metadata"]),
  support_ticket_messages: new Set(["attachments", "metadata"]),
  support_escalation_rules: new Set(["condition_value", "action_value"]),
  support_analytics_daily: new Set([
    "top_categories",
    "top_intents",
    "sentiment_distribution",
  ]),
  riders: new Set(["metadata"]),
  delivery_assignments: new Set(["metadata"]),
};

export const FK_MAP: Record<string, FkEdge[]> = {
  ai_memory: [
    {
      column: "source_conversation_id",
      foreignTable: "chat_conversations",
      foreignColumn: "id",
    },
  ],
  cart_items: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
    { column: "variant_id", foreignTable: "product_variants", foreignColumn: "id" },
  ],
  categories: [
    { column: "parent_id", foreignTable: "categories", foreignColumn: "id" },
  ],
  delivery_assignments: [
    { column: "order_id", foreignTable: "orders", foreignColumn: "id" },
    { column: "rider_id", foreignTable: "riders", foreignColumn: "id" },
    { column: "zone_id", foreignTable: "delivery_zones", foreignColumn: "id" },
  ],
  delivery_status_history: [
    {
      column: "assignment_id",
      foreignTable: "delivery_assignments",
      foreignColumn: "id",
    },
  ],
  navigation_items: [
    { column: "menu_id", foreignTable: "navigation_menus", foreignColumn: "id" },
    { column: "parent_id", foreignTable: "navigation_items", foreignColumn: "id" },
  ],
  order_items: [
    { column: "order_id", foreignTable: "orders", foreignColumn: "id" },
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
    { column: "variant_id", foreignTable: "product_variants", foreignColumn: "id" },
  ],
  order_status_history: [
    { column: "order_id", foreignTable: "orders", foreignColumn: "id" },
  ],
  product_images: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
  ],
  product_variants: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
  ],
  products: [
    { column: "category_id", foreignTable: "categories", foreignColumn: "id" },
  ],
  return_items: [
    {
      column: "return_request_id",
      foreignTable: "return_requests",
      foreignColumn: "id",
    },
    { column: "order_item_id", foreignTable: "order_items", foreignColumn: "id" },
  ],
  return_requests: [
    { column: "order_id", foreignTable: "orders", foreignColumn: "id" },
  ],
  review_images: [
    { column: "review_id", foreignTable: "reviews", foreignColumn: "id" },
  ],
  reviews: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
  ],
  riders: [
    { column: "zone_id", foreignTable: "delivery_zones", foreignColumn: "id" },
  ],
  support_feedback: [
    {
      column: "conversation_id",
      foreignTable: "chat_conversations",
      foreignColumn: "id",
    },
    { column: "ticket_id", foreignTable: "support_tickets", foreignColumn: "id" },
  ],
  support_knowledge_base: [
    {
      column: "source_ticket_id",
      foreignTable: "support_tickets",
      foreignColumn: "id",
    },
  ],
  support_ticket_messages: [
    { column: "ticket_id", foreignTable: "support_tickets", foreignColumn: "id" },
  ],
  support_tickets: [
    {
      column: "conversation_id",
      foreignTable: "chat_conversations",
      foreignColumn: "id",
    },
  ],
  wishlist_items: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
  ],
};
