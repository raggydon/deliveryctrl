// lib/time.ts
import { startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const IST = "Asia/Kolkata";

// Get current time in IST
export function nowIST() {
    return toZonedTime(new Date(), IST);
}

// Get today's start in IST (e.g., for grouping by day)
export function startOfTodayIST() {
    return startOfDay(nowIST());
}

// Format a UTC date as YYYY-MM-DD in IST
export function formatDateKeyIST(date: Date) {
    return startOfDay(toZonedTime(date, IST)).toISOString().split("T")[0];
}
