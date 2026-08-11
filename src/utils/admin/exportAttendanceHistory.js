import axios from "axios";

export async function exportAttendanceHistory(id, month, format) {
    try {
        const params = new URLSearchParams();

        params.set("id", id);
        params.set("format", format);

        // Only send month when selected
        if (month) {
            params.set("month", month);
        }

        const res = await axios.get(
            `/api/admin/export-attendance-history?${params.toString()}`,
            {
                responseType: "blob",
            }
        );

        const blob = new Blob([res.data], {
            type: res.headers["content-type"],
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;

        link.download =
            format === "excel"
                ? "attendance-history.xlsx"
                : "attendance-history.pdf";

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            message: "Attendance history exported successfully.",
        };

    } catch (error) {
        console.log("Export attendance history error:", error);

        // Because responseType is blob, backend JSON errors
        // will also arrive as a Blob.
        let message =
            "An error occurred while exporting attendance history.";

        if (error.response?.data instanceof Blob) {
            try {
                const text = await error.response.data.text();
                const data = JSON.parse(text);

                message =
                    data.message || message;
            } catch {
                // Keep default message
            }
        }

        return {
            success: false,
            message,
        };
    }
}