import { jsPDF } from "jspdf";

export function generatePendingPaymentsPDF({
    pendingPayments,
    workerType,
}) {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    // --------------------------------
    // Helpers
    // --------------------------------

    const formatCurrency = (value) => {
        return `Rs. ${Number(
            value || 0
        ).toLocaleString("en-IN")}`;
    };

    const formatDate = (value) => {
        if (!value) return "-";

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return "-";
        }

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const year =
            date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    // --------------------------------
    // Title
    // --------------------------------

    doc.setFontSize(18);
    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "PENDING PAYMENTS REPORT",
        148.5,
        18,
        {
            align: "center",
        }
    );

    // --------------------------------
    // Report information
    // --------------------------------

    doc.setFontSize(10);
    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        `Worker Type: ${workerType}`,
        15,
        30
    );

    doc.text(
        `Generated On: ${formatDate(
            new Date()
        )}`,
        15,
        36
    );

    // --------------------------------
    // Summary
    // --------------------------------

    const totalWorkers =
        pendingPayments.length;

    const pendingWorkers =
        pendingPayments.filter(
            (worker) =>
                Number(worker.pending) > 0
        );

    const advanceWorkers = 
        pendingPayments.filter(
            (worker) =>
                Number(worker.pending) < 0
        );

    const totalPending =
        pendingWorkers.reduce(
            (total, worker) =>
                total +
                Number(
                    worker.pending || 0
                ),
            0
        );

    const totalAdvance =
        advanceWorkers.reduce(
            (total, worker) =>
                total +
                Math.abs(
                    Number(
                        worker.pending || 0
                    )
                ),
            0
        );

    // --------------------------------
    // Summary
    // --------------------------------

    doc.setFontSize(10);
    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        `Workers: ${totalWorkers}`,
        15,
        47
    );

    doc.text(
        `Pending Workers: ${pendingWorkers.length}`,
        65,
        47
    );

    doc.text(
        `Pending: ${formatCurrency(
            totalPending
        )}`,
        125,
        47
    );

    doc.text(
        `Advance Workers: ${advanceWorkers.length}`,
        190,
        47
    );

    doc.text(
        `Advance: ${formatCurrency(
            totalAdvance
        )}`,
        255,
        47
    );

    // --------------------------------
    // Table
    // --------------------------------

    let y = 60;

    const columns = {
        worker: 15,
        type: 55,
        wage: 90,
        joined: 120,
        worked: 155,
        earned: 185,
        paid: 225,
        pending: 265,
    };

    // --------------------------------
    // Header
    // --------------------------------

    doc.setFontSize(9);
    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Worker",
        columns.worker,
        y
    );

    doc.text(
        "Type",
        columns.type,
        y
    );

    doc.text(
        "Daily Wage",
        columns.wage,
        y
    );

    doc.text(
        "Joined",
        columns.joined,
        y
    );

    doc.text(
        "Worked",
        columns.worked,
        y
    );

    doc.text(
        "Earned",
        columns.earned,
        y
    );

    doc.text(
        "Paid",
        columns.paid,
        y
    );

    doc.text(
        "Pending",
        columns.pending,
        y
    );

    doc.line(
        15,
        y + 2,
        285,
        y + 2
    );

    y += 9;

    // --------------------------------
    // Rows
    // --------------------------------

    doc.setFont(
        "helvetica",
        "normal"
    );

    pendingPayments.forEach(
        (worker) => {

            // --------------------------------
            // New page
            // --------------------------------

            if (y > 190) {
                doc.addPage();

                y = 20;

                // Page title
                doc.setFontSize(14);
                doc.setFont(
                    "helvetica",
                    "bold"
                );

                doc.text(
                    "PENDING PAYMENTS REPORT",
                    148.5,
                    y,
                    {
                        align: "center",
                    }
                );

                y += 14;

                // Table header
                doc.setFontSize(9);

                doc.text(
                    "Worker",
                    columns.worker,
                    y
                );

                doc.text(
                    "Type",
                    columns.type,
                    y
                );

                doc.text(
                    "Daily Wage",
                    columns.wage,
                    y
                );

                doc.text(
                    "Joined",
                    columns.joined,
                    y
                );

                doc.text(
                    "Worked",
                    columns.worked,
                    y
                );

                doc.text(
                    "Earned",
                    columns.earned,
                    y
                );

                doc.text(
                    "Paid",
                    columns.paid,
                    y
                );

                doc.text(
                    "Pending",
                    columns.pending,
                    y
                );

                doc.line(
                    15,
                    y + 2,
                    285,
                    y + 2
                );

                y += 9;

                doc.setFont(
                    "helvetica",
                    "normal"
                );
            }

            // --------------------------------
            // Data
            // --------------------------------

            const pending =
                Number(
                    worker.pending || 0
                );

            // Worker
            doc.text(
                String(
                    worker.workerName || "-"
                ).substring(0, 20),
                columns.worker,
                y
            );

            // Type
            doc.text(
                String(
                    worker.workerType || "-"
                ).substring(0, 14),
                columns.type,
                y
            );

            // Daily wage
            doc.text(
                formatCurrency(
                    worker.dailyWage
                ),
                columns.wage,
                y
            );

            // Joining date
            doc.text(
                formatDate(
                    worker.joiningDate
                ),
                columns.joined,
                y
            );

            // Worked days
            doc.text(
                Number(
                    worker.workedDays || 0
                ).toString(),
                columns.worked,
                y
            );

            // Earned
            doc.text(
                formatCurrency(
                    worker.totalEarned
                ),
                columns.earned,
                y
            );

            // Paid
            doc.text(
                formatCurrency(
                    worker.totalPaid
                ),
                columns.paid,
                y
            );

            // Pending / Advance
            doc.text(
                formatCurrency(
                    pending
                ),
                columns.pending,
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

        doc.setFontSize(8);

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            `Work Ledger | Page ${page} of ${pageCount}`,
            148.5,
            205,
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