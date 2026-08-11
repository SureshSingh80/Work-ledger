
import { formatISTDate } from "@/lib/dateUtils";
import jsPDF from "jspdf";

export async function generateAttendancePDF({
    worker,
    attendanceHistory,
    year,
    month,
}) {
    const doc = new jsPDF();

    // -----------------------------
    // Title
    // -----------------------------

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    doc.text(
        "ATTENDANCE HISTORY",
        105,
        20,
        {
            align: "center",
        }
    );

    // -----------------------------
    // Worker information
    // -----------------------------

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(
        `Worker: ${worker.name}`,
        20,
        35
    );

    doc.text(
        `Worker Type: ${worker.workerType}`,
        20,
        42
    );

    doc.text(
        month
            ? `Period: ${year}-${String(month).padStart(2, "0")}`
            : `Period: ${year}`,
        20,
        49
    );

    // -----------------------------
    // Summary
    // -----------------------------

    const total = attendanceHistory.length;

    const present = attendanceHistory.filter(
        (item) => item.status === "Present"
    ).length;

    const absent = attendanceHistory.filter(
        (item) => item.status === "Absent"
    ).length;

    doc.setFont("helvetica", "bold");

    doc.text("Summary", 20, 62);

    doc.setFont("helvetica", "normal");

    doc.text(
        `Total Records: ${total}`,
        20,
        69
    );

    doc.text(
        `Present: ${present}`,
        20,
        76
    );

    doc.text(
        `Absent: ${absent}`,
        20,
        83
    );

    // -----------------------------
    // Table header
    // -----------------------------

    let y = 98;

    doc.setFont("helvetica", "bold");

    doc.text("Date", 20, y);
    doc.text("Status", 100, y);

    doc.line(
        20,
        y + 2,
        190,
        y + 2
    );

    // -----------------------------
    // Attendance rows
    // -----------------------------

    doc.setFont("helvetica", "normal");

    y += 12;

    attendanceHistory.forEach(
        (attendance) => {

            if (y > 275) {
                doc.addPage();

                y = 20;

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "ATTENDANCE HISTORY",
                    105,
                    y,
                    {
                        align: "center",
                    }
                );

                y += 15;

                doc.text(
                    "Date",
                    20,
                    y
                );

                doc.text(
                    "Status",
                    100,
                    y
                );

                y += 10;

                doc.setFont(
                    "helvetica",
                    "normal"
                );
            }

            const formattedDate =
                formatISTDate(
                    attendance.attendanceDate
                );

            doc.text(
                formattedDate,
                20,
                y
            );

            doc.text(
                attendance.status,
                100,
                y
            );

            y += 8;
        }
    );

    // -----------------------------
    // Footer
    // -----------------------------

    const pageCount =
        doc.internal.getNumberOfPages();

    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {
        doc.setPage(page);

        doc.setFontSize(9);

        doc.text(
            `Work Ledger | Page ${page} of ${pageCount}`,
            105,
            290,
            {
                align: "center",
            }
        );
    }

    // Return PDF as ArrayBuffer
    return doc.output("arraybuffer");
}