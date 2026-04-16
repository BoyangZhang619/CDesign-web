export interface AISummaryData {
  id?: number
  daily_checkin_id?: number
  meal_ai_summary: string | null
  exercise_ai_summary: string | null
  sleep_ai_summary: string | null
  total_ai_summary: string | null
  updated_flags: {
    meal: boolean
    exercise: boolean
    sleep: boolean
    total: boolean
  }
}

export interface AISummaryResponse {
  success: boolean
  data: AISummaryData | null
  checkin_date: string
  message: string
}
