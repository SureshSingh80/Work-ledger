import axios from "axios";

export async function exportPendingPayments(format,workerType) {
    try {
        const params = new URLSearchParams();
        console.log("params= ",params);

        params.set("format", format);

        params.set("workerType", workerType);
        const res = await axios.get(
           `/api/admin/export-pending-payments?${params.toString()}`,
            {
                responseType: "blob",
            }
        );

        // const blob = new Blob([res.data], {
        //     type: res.headers["content-type"],
        // });

        const blob = res.data;

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = res.headers["content-disposition"];

        let filename = "pending-payments";

            if (contentDisposition) {
                const match =
                    contentDisposition.match(
                        /filename="?([^"]+)"?/i
                    );

                if (match?.[1]) {
                    filename = match[1];
                }
            }
       

          link.download = filename;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            message: "Pending Payments exported successfully.",
        };

    } catch (error) {
        console.log("Export Pending Payment error:", error);

        // Because responseType is blob, backend JSON errors
        // will also arrive as a Blob.
        let message =
            "An error occurred while exporting Pending Payments.";

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