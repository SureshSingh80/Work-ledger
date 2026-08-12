import { jsPDF } from "jspdf";
import { formatISTDate } from "@/lib/dateUtils";

export async function generatePaymentHistoryPDF({
    worker,
    paymentHistory,
    year,
    month,
}) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // --------------------------------
    // Title
    // --------------------------------

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    doc.text(
        "PAYMENT HISTORY",
        105,
        20,
        {
            align: "center",
        }
    );

    // --------------------------------
    // Worker information
    // --------------------------------

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
            ? `Period: ${year}-${String(month).padStart(
                  2,
                  "0"
              )}`
            : `Period: ${year}`,
        20,
        49
    );

    // --------------------------------
    // Calculate summary
    // --------------------------------

    const totalPayments =
        paymentHistory.length;

    const totalPaid =
        paymentHistory.reduce(
            (total, payment) =>
                total + Number(payment.amount || 0),
            0
        );

    // --------------------------------
    // Summary
    // --------------------------------

    doc.setFont("helvetica", "bold");

    doc.text(
        "Summary",
        20,
        62
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        `Total Payments: ${totalPayments}`,
        20,
        69
    );

    doc.text(
        `Total Paid: Rs. ${totalPaid.toLocaleString(
            "en-IN"
        )}`,
        20,
        76
    );

    // --------------------------------
    // Table header
    // --------------------------------

    let y = 91;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Date",
        20,
        y
    );

    doc.text(
        "Amount",
        120,
        y
    );

    doc.line(
        20,
        y + 2,
        190,
        y + 2
    );

    // --------------------------------
    // Payment rows
    // --------------------------------

    doc.setFont(
        "helvetica",
        "normal"
    );

    y += 12;

    paymentHistory.forEach(
        (payment) => {

            // New page
            if (y > 275) {

                doc.addPage();

                y = 20;

                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "PAYMENT HISTORY",
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
                    "Amount",
                    120,
                    y
                );

                doc.line(
                    20,
                    y + 2,
                    190,
                    y + 2
                );

                y += 10;

                doc.setFont(
                    "helvetica",
                    "normal"
                );
            }

            // --------------------------------
            // IST date
            // --------------------------------

            const formattedDate =
                formatISTDate(
                    payment.paymentDate
                );

            // --------------------------------
            // Date
            // --------------------------------

            doc.text(
                formattedDate,
                20,
                y
            );

            // --------------------------------
            // Amount
            // --------------------------------

            doc.text(
                `Rs. ${Number(
                    payment.amount || 0
                ).toLocaleString("en-IN")}`,
                120,
                y
            );

            y += 8;
        }
    );

    // --------------------------------
    // Footer
    // --------------------------------

    const pageCount =
        doc.internal.getNumberOfPages();

    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {
        doc.setPage(page);

        doc.setFontSize(9);
        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            `Work Ledger | Page ${page} of ${pageCount}`,
            105,
            290,
            {
                align: "center",
            }
        );
    }

    // --------------------------------
    // Return PDF
    // --------------------------------

    return doc.output(
        "arraybuffer"
    );
}