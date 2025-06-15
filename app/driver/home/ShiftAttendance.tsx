"use client";

import { useState } from "react";
import React from "react";

type Props = {
    driverId: string;
    shift: "MORNING" | "EVENING" | "BOTH";
};

export default function ShiftAttendance({ driverId, shift }: Props) {
    const [marking, setMarking] = useState(false);
    const [message, setMessage] = useState("");

    const markAttendance = async (shiftToMark: "MORNING" | "EVENING") => {
        setMarking(true);
        setMessage("");

        try {
            const res = await fetch("/api/attendance/mark", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ shift: shiftToMark }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Marked active for ${shiftToMark} shift!`);
            } else {
                setMessage(`${data.error || "Failed to mark attendance"}`);
            }
        } catch (error) {
            setMessage("Error while marking attendance");
        }

        setMarking(false);
    };

    const showMorning = shift === "MORNING" || shift === "BOTH";
    const showEvening = shift === "EVENING" || shift === "BOTH";

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Mark Availability for Today</h2>
            <div className="flex gap-4">
                {showMorning && (
                    <button
                        onClick={() => markAttendance("MORNING")}
                        disabled={marking}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Mark Morning
                    </button>
                )}
                {showEvening && (
                    <button
                        onClick={() => markAttendance("EVENING")}
                        disabled={marking}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                        Mark Evening
                    </button>
                )}
            </div>
            {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
        </div>
    );
}
