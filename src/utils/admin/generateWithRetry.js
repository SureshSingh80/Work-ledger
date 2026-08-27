import { ai } from "@/utils/admin/gemini";

const workLedgerTools = [
    {
        functionDeclarations: [
            {
                name: "get_total_pending",

                description:
                    "Get the current total pending payment amount for all workers in Work Ledger. Use this when the user asks about total pending amount, outstanding worker payment, remaining payment, or how much money is left to pay workers.",

                parameters: {
                    type: "OBJECT",
                    properties: {},
                },
            },
            {
                name: "get_worker_summary",

                description:
                    "Get the work and financial summary of a specific worker in Work Ledger. Use this when the user asks about a particular worker's pending amount, advance amount, total earned, total paid, worked days, daily wage, or general worker summary.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        workerName: {
                            type: "STRING",

                            description:
                                "The name of the worker mentioned by the user.",
                        },
                    },

                    required: [
                        "workerName"
                    ],
                },
            },
        ],
    },
];

export async function generateWithRetry(
    message,
    retries = 3
) {
    for (
        let attempt = 0;
        attempt < retries;
        attempt++
    ) {
        try {
            return await ai.models.generateContent({
                model: "gemini-3.7-flash",

                contents: message,

                config: {
                    tools: workLedgerTools,

                    systemInstruction: `
                        You are the AI assistant for Work Ledger,
                        a worker attendance and payment management system.

                        Use the available tools whenever the user's
                        question requires actual Work Ledger data.

                        Never invent worker, attendance, payment,
                        or financial data.

                        Keep answers short and clear.
                    `,

                    maxOutputTokens: 300,
                    temperature: 0.2,
                },
            });

        } catch (error) {
            const isUnavailable =
                error?.status === 503;

            if (
                !isUnavailable ||
                attempt === retries - 1
            ) {
                throw error;
            }

            const delay =
                Math.pow(2, attempt) * 1000;

            await new Promise((resolve) =>
                setTimeout(resolve, delay)
            );
        }
    }
}