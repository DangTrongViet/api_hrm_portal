export interface CreateLeaveDto {
  start_date: Date;
  end_date: Date;
  reason?: string;
}

export interface UpdateLeaveDto {
  start_date?: Date;
  end_date?: Date;
  reason?: string;
  status?: "pending" | "approved" | "rejected";
}
