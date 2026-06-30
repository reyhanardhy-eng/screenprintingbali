export type Conversation = {
  id: string;
  visitor_id: string;
  visitor_email: string | null;
  status: "open" | "closed";
  created_at: string;
  last_message_at: string;
};

export type ChatMessage = {
  id: number;
  conversation_id: string;
  sender: "visitor" | "admin";
  sender_id: string;
  body: string;
  read_by_admin: boolean;
  read_by_visitor: boolean;
  created_at: string;
};
