import mongoose from "mongoose";
import Worker from "@/models/Worker";

export async function getWorkforceSummary(adminId) {
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    const result = await Worker.aggregate([
        // -----------------------------------
        // Current Admin's Workers
        // -----------------------------------
        {
            $match: {
                adminId: adminObjectId,
            },
        },

        // -----------------------------------
        // Calculate Everything Together
        // -----------------------------------
        {
            $facet: {
                // Total workers
                totalWorkers: [
                    {
                        $count: "count",
                    },
                ],

                // Active workers
                activeWorkers: [
                    {
                        $match: {
                            isActive: true,
                        },
                    },
                    {
                        $count: "count",
                    },
                ],

                // Inactive workers
                inactiveWorkers: [
                    {
                        $match: {
                            isActive: false,
                        },
                    },
                    {
                        $count: "count",
                    },
                ],

                // Worker type distribution
                workerTypes: [
                    {
                        $group: {
                            _id: "$workerType",
                            count: {
                                $sum: 1,
                            },
                        },
                    },

                    {
                        $project: {
                            _id: 0,
                            workerType: "$_id",
                            count: 1,
                        },
                    },

                    {
                        $sort: {
                            count: -1,
                        },
                    },
                ],
            },
        },
    ]);

    const summary = result[0] || {};

    const totalWorkers =
        summary.totalWorkers?.[0]?.count || 0;

    const activeWorkers =
        summary.activeWorkers?.[0]?.count || 0;

    const inactiveWorkers =
        summary.inactiveWorkers?.[0]?.count || 0;

    const existingTypes =
        summary.workerTypes || [];

    // -----------------------------------
    // Include Types With Zero Workers
    // -----------------------------------

    const allWorkerTypes = [
        "Rajmistri",
        "Helper",
        "Painter",
        "Electrician",
        "Plumber",
        "Carpenter",
        "Other",
    ];

    const workerTypes = allWorkerTypes.map(
        (workerType) => {
            const found =
                existingTypes.find(
                    (item) =>
                        item.workerType ===
                        workerType
                );

            return {
                workerType,
                count: found?.count || 0,
            };
        }
    );

    return {
        totalWorkers,
        activeWorkers,
        inactiveWorkers,
        workerTypes,
    };
}