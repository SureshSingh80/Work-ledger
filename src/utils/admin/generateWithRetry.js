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
            {
                name: "get_payment_summary",

                description:
                    "Get the total amount paid to workers in Work Ledger. Use this when the user asks about total payments, how much money has been paid to workers, payments made this month, payments in a specific month, or payments in a specific year.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        month: {
                            type: "NUMBER",

                            description:
                                "Optional month number from 1 to 12. Use when the user asks about payments for a specific month.",
                        },

                        year: {
                            type: "NUMBER",

                            description:
                                "Optional four-digit year such as 2026. Use when the user asks about payments for a specific year.",
                        },

                        period: {
                            type: "STRING",

                            enum: [
                                "all_time",
                                "this_month",
                                "specific_month",
                                "specific_year",
                            ],

                            description:
                                "The payment time period. Use 'all_time' when the user asks for total payment without specifying any date, month, or year. Use 'this_month' for the current month, 'specific_month' when a particular month is requested, and 'specific_year' when a whole year is requested.",
                        },
                    },

                    required: ["period"],
                },
            },
            {   // Bug found
                name: "get_attendance_summary", 

                description:
                    "Get the overall attendance summary of workers in Work Ledger. Use this when the user asks about total attendance, total present, absent, half days, worked days, attendance for the current month, a specific month, or a specific year.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        period: {
                            type: "STRING",

                            enum: [
                                "all_time",
                                "this_month",
                                "specific_month",
                                "specific_year",
                            ],

                            description:
                                "The attendance time period. Use 'all_time' when the user asks for overall attendance without specifying any date, month, or year. Use 'this_month' for the current month, 'specific_month' when a particular month is requested, and 'specific_year' when a whole year is requested.",
                        },

                        month: {
                            type: "NUMBER",

                            description:
                                "Month number from 1 to 12. Provide this when period is 'specific_month'.",
                        },

                        year: {
                            type: "NUMBER",

                            description:
                                "Four-digit year such as 2026. Provide this when period is 'specific_month' or 'specific_year'.",
                        },
                    },

                    required: ["period"],
                },
            },
            {
                name: "get_pending_workers",

                description:
                    "Get workers who currently have pending payment amounts in Work Ledger. Use this when the user asks which workers still need to be paid, workers with outstanding balances, who has the highest pending payment, or a list of workers with pending amounts.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        limit: {
                            type: "NUMBER",

                            description:
                            "Maximum number of workers to return. Provide this only when the user specifies a number, such as 5 for 'top 5'. If the user does not specify a limit, omit this argument so all pending workers are returned.",
                        },

                        sort: {
                            type: "STRING",

                            enum: [
                                "highest_pending",
                                "lowest_pending",
                            ],

                            description:
                                "How to order workers by pending amount. Use 'highest_pending' by default or when the user asks for the highest/top pending workers. Use 'lowest_pending' when the user asks for workers with the lowest pending amounts.",
                        },
                    },

                    required: [
                        
                    ],
                },
            },
           {
                name: "get_worker_payment_summary",

                description:
                    "Get the total payment made to a specific worker in Work Ledger. Use this when the user asks how much a particular worker has been paid, salary or wages paid to a worker, or payment made to a worker for all time, the current month, a specific month, or a specific year.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        workerName: {
                            type: "STRING",

                            description:
                                "The name of the worker mentioned by the user.",
                        },

                        period: {
                            type: "STRING",

                            enum: [
                                "all_time",
                                "this_month",
                                "specific_month",
                                "specific_year",
                            ],

                            description:
                                "The payment time period. Use 'all_time' when no date, month, or year is specified. Use 'this_month' for the current month, 'specific_month' when a particular month is requested, and 'specific_year' when a whole year is requested.",
                        },

                        month: {
                            type: "NUMBER",

                            description:
                                "Month number from 1 to 12. Provide this when period is 'specific_month'.",
                        },

                        year: {
                            type: "NUMBER",

                            description:
                                "Four-digit year such as 2026. Provide this when period is 'specific_month' or 'specific_year'.",
                        },
                    },

                    required: [
                        "workerName",
                        "period",
                    ],
                },
            },
            {
                name: "get_worker_attendance_summary",

                description:
                    "Get the attendance summary of a specific worker in Work Ledger. Use this when the user asks about a particular worker's attendance, present days, absent days, half days, or worked days for all time, the current month, a specific month, or a specific year.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        workerName: {
                            type: "STRING",

                            description:
                                "The name of the worker mentioned by the user.",
                        },

                        period: {
                            type: "STRING",

                            enum: [
                                "all_time",
                                "this_month",
                                "specific_month",
                                "specific_year",
                            ],

                            description:
                                "The attendance time period. Use 'all_time' when no date, month, or year is specified. Use 'this_month' for the current month, 'specific_month' when a particular month is requested, and 'specific_year' when a whole year is requested.",
                        },

                        month: {
                            type: "NUMBER",

                            description:
                                "Month number from 1 to 12. Provide this when period is 'specific_month'.",
                        },

                        year: {
                            type: "NUMBER",

                            description:
                                "Four-digit year such as 2026. Provide this when period is 'specific_month' or 'specific_year'.",
                        },
                    },

                    required: [
                        "workerName",
                        "period",
                    ],
                },
            },
            {
                name: "get_workers",

                description:
                    "Get workers and their basic details from Work Ledger. Use this when the user asks for all workers, worker list, number of workers, active or inactive workers, or workers belonging to a specific worker type. This tool returns basic worker profile information and does not calculate attendance, payments, earnings, or pending amounts.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        status: {
                            type: "STRING",

                            enum: [
                                "all",
                                "active",
                                "inactive",
                            ],

                            description:
                                "Filter workers by status. Use 'all' when the user does not specify active or inactive workers.",
                        },

                        workerType: {
                            type: "STRING",

                            enum: [
                                "Rajmistri",
                                "Helper",
                                "Painter",
                                "Electrician",
                                "Plumber",
                                "Carpenter",
                                "Other",
                            ],

                            description:
                                "Optional worker type filter. Provide this only when the user asks for workers of a particular type.",
                        },

                        limit: {
                            type: "NUMBER",

                            description:
                                "Maximum number of workers to return. Provide this only when the user explicitly specifies a number such as 'show 5 workers'. Otherwise omit it so all matching workers are returned.",
                        },
                    },

                    required: [],
                },
            },
           {
                name: "get_advance_workers",

                description:
                    "Get workers who have received advance payments in Work Ledger. A worker has an advance when their total paid amount is greater than their total earned amount. Use this when the user asks which workers have received advance payments, who has the highest or lowest advance, or asks for a list of workers with advance balances.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        limit: {
                            type: "NUMBER",

                            description:
                                "Maximum number of workers to return. Provide this only when the user specifies a number such as 'top 5'. If no number is specified, omit this argument so all workers with advance payments are returned.",
                        },

                        sort: {
                            type: "STRING",

                            enum: [
                                "highest_advance",
                                "lowest_advance",
                            ],

                            description:
                                "How to order workers by advance amount. Use 'highest_advance' by default or when the user asks for the highest advance. Use 'lowest_advance' when the user asks for the lowest advance.",
                        },
                    },

                    required: [],
                },
            },
           {
            name: "get_top_earners",

            description:
                "Get workers ranked by the amount they earned from work in Work Ledger. Use this when the user asks for highest earning workers, top earners, who earned the most, or worker earnings rankings for all time, the current month, a specific month, or a specific year. Earnings are calculated from attendance and daily wage, not from payments received.",

            parameters: {
                type: "OBJECT",

                properties: {
                    period: {
                        type: "STRING",

                        enum: [
                            "all_time",
                            "this_month",
                            "specific_month",
                            "specific_year",
                        ],

                        description:
                            "The earning period. Use 'all_time' when no time period is specified, 'this_month' for the current month, 'specific_month' for a particular month, and 'specific_year' for a whole year.",
                    },

                    month: {
                        type: "NUMBER",

                        description:
                            "Month number from 1 to 12. Provide this when period is 'specific_month'.",
                    },

                    year: {
                        type: "NUMBER",

                        description:
                            "Four-digit year such as 2026. Provide this when period is 'specific_month' or 'specific_year'.",
                    },

                    limit: {
                        type: "NUMBER",

                        description:
                            "Maximum number of workers to return. For example, use 5 when the user asks for the top 5 workers. If the user does not specify a number, omit this argument.",
                    },
                },

                required: ["period"],
            },
           },
           {
                name: "get_workforce_summary",

                description:
                    "Get an overall workforce summary from Work Ledger. Use this when the user asks how many workers there are, how many are active or inactive, or asks for a breakdown of workers by worker type such as Rajmistri, Helper, Painter, Electrician, Plumber, Carpenter, or Other.",

                parameters: {
                    type: "OBJECT",

                    properties: {},

                    required: [],
                },
            },
            {
                name: "get_dashboard_summary",

                description:
                    "Get a high-level overall summary of Work Ledger. Use this when the user asks for an overall overview, dashboard summary, overall status, business summary, or a combined summary of workers, attendance, earnings, payments, and pending amounts. This tool provides aggregated information rather than detailed individual records.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        period: {
                            type: "STRING",

                            enum: [
                                "all_time",
                                "this_month",
                                "specific_month",
                                "specific_year",
                            ],

                            description:
                                "The period for attendance, earnings, and payment statistics. Use 'all_time' when the user asks for an overall summary without specifying a time period. Use 'this_month' for the current month, 'specific_month' for a particular month, and 'specific_year' for a whole year.",
                        },

                        month: {
                            type: "NUMBER",

                            description:
                                "Month number from 1 to 12. Provide this when period is 'specific_month'.",
                        },

                        year: {
                            type: "NUMBER",

                            description:
                                "Four-digit year such as 2026. Provide this when period is 'specific_month' or 'specific_year'.",
                        },
                    },

                    required: ["period"],
                },
            }
        ],
    },
];

export async function generateWithRetry(
    message,
    retries = 1
) {
    for (let attempt = 0; attempt < retries; attempt++) {

        console.time(`Gemini-${attempt + 1}`);

        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.7-flash",

                contents: message,

                config: {
                    tools: workLedgerTools,

                    // Reduce reasoning-token usage
                    thinkingConfig: {
                        thinkingLevel: "low",
                    },

                    systemInstruction: `
                        You are the AI assistant for Work Ledger,
                        a worker attendance and payment management system.

                        Use available tools for actual Work Ledger data.
                        Never invent worker, attendance, payment,
                        or financial data.

                        Keep answers short and clear.
                    `,

                    // Prevent unnecessarily long responses
                    maxOutputTokens: 300,
                },
            });

            console.timeEnd(`Gemini-${attempt + 1}`);

            return response;

        } catch (error) {

            console.timeEnd(`Gemini-${attempt + 1}`);

            console.log("Gemini status:", error?.status);
            console.log("Gemini error:", error?.message);
            console.log(
                "Gemini cause:",
                error?.cause?.code
            );

            throw error;
        }
    }
}