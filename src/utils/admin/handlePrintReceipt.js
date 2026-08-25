const  handlePrintReceipt = (printableData) => {
    if (!printableData) return;

    const { payment, worker } = printableData;

    if (!payment || !worker) return;

    const printWindow = window.open(
        "",
        "_blank",
        "width=800,height=700"
    );

    if (!printWindow) {
        alert("Please allow popups to print receipt.");
        return;
    }

    // --------------------------------
    // Format payment date in IST
    // --------------------------------

    const paymentDate = payment.paymentDate
        ? new Intl.DateTimeFormat("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          }).format(
              new Date(payment.paymentDate)
          )
        : "-";

    // --------------------------------
    // Format amount
    // --------------------------------

    const amount = Number(
        payment.amount || 0
    ).toLocaleString("en-IN");

    // --------------------------------
    // Receipt HTML
    // --------------------------------

    printWindow.document.write(`
        <!DOCTYPE html>

        <html>
        <head>
            <title>
                Payment Receipt - ${worker.name}
            </title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 30px;
                    font-family: Arial, sans-serif;
                    color: #1f2937;
                    background: #ffffff;
                }

                .receipt {
                    width: 100%;
                    max-width: 650px;
                    margin: auto;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    padding: 30px;
                }

                /* -------------------------
                   Header
                ------------------------- */

                .header {
                    text-align: center;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 18px;
                    margin-bottom: 25px;
                }

                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }

                .header p {
                    margin: 6px 0 0;
                    font-size: 13px;
                    color: #6b7280;
                }

                /* -------------------------
                   Amount
                ------------------------- */

                .amount {
                    text-align: center;
                    background: #f9fafb;
                    padding: 20px;
                    margin-bottom: 25px;
                    border-radius: 8px;
                }

                .amount-label {
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                .amount-value {
                    margin-top: 5px;
                    font-size: 28px;
                    font-weight: bold;
                }

                /* -------------------------
                   Details
                ------------------------- */

                .row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;

                    padding: 10px 0;

                    border-bottom:
                        1px solid #f3f4f6;
                }

                .label {
                    color: #6b7280;
                    font-size: 14px;
                }

                .value {
                    font-size: 14px;
                    font-weight: 600;
                    text-align: right;
                    word-break: break-word;
                }

                /* -------------------------
                   Note
                ------------------------- */

                .note {
                    margin-top: 20px;
                }

                .note-title {
                    color: #6b7280;
                    font-size: 14px;
                }

                .note-content {
                    margin-top: 8px;

                    background: #f9fafb;

                    padding: 12px;

                    border-radius: 6px;

                    font-size: 13px;

                    line-height: 1.5;
                }

                /* -------------------------
                   Footer
                ------------------------- */

                .footer {
                    margin-top: 30px;
                    padding-top: 15px;

                    border-top:
                        1px solid #e5e7eb;

                    text-align: center;

                    font-size: 11px;
                    color: #9ca3af;
                }

                /* -------------------------
                   Printing
                ------------------------- */

                @media print {
                    body {
                        padding: 0;
                    }

                    .receipt {
                        border: none;
                        max-width: 100%;
                    }

                    @page {
                        margin: 15mm;
                    }
                }
            </style>
        </head>

        <body>

            <div class="receipt">

                <!-- Header -->

                <div class="header">

                    <h1>
                        WORK LEDGER
                    </h1>

                    <p>
                        Payment Receipt
                    </p>

                </div>


                <!-- Amount -->

                <div class="amount">

                    <div class="amount-label">
                        Amount Paid
                    </div>

                    <div class="amount-value">
                        Rs. ${amount}
                    </div>

                </div>


                <!-- Worker -->

                <div class="row">

                    <span class="label">
                        Worker
                    </span>

                    <span class="value">
                        ${worker.name || "-"}
                    </span>

                </div>


                <!-- Worker Type -->

                <div class="row">

                    <span class="label">
                        Worker Type
                    </span>

                    <span class="value">
                        ${worker.workerType || "-"}
                    </span>

                </div>


                <!-- Mobile -->

                <div class="row">

                    <span class="label">
                        Mobile
                    </span>

                    <span class="value">
                        ${worker.mobile || "-"}
                    </span>

                </div>


                <!-- Payment Date -->

                <div class="row">

                    <span class="label">
                        Payment Date
                    </span>

                    <span class="value">
                        ${paymentDate}
                    </span>

                </div>


                <!-- Payment Method -->

                <div class="row">

                    <span class="label">
                        Payment Method
                    </span>

                    <span class="value">
                        ${payment.paymentMethod || "-"}
                    </span>

                </div>


                <!-- Payment ID -->

                <div class="row">

                    <span class="label">
                        Payment ID
                    </span>

                    <span class="value">
                        ${payment._id || "-"}
                    </span>

                </div>


                ${
                    payment.note?.trim()
                        ? `
                            <div class="note">

                                <div class="note-title">
                                    Note
                                </div>

                                <div class="note-content">
                                    ${payment.note}
                                </div>

                            </div>
                        `
                        : ""
                }


                <!-- Footer -->

                <div class="footer">
                    Generated by Work Ledger
                </div>

            </div>

        </body>
        </html>
    `);

    printWindow.document.close();

    // --------------------------------
    // Print
    // --------------------------------

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
    };
};

export default handlePrintReceipt

