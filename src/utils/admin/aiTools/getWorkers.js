import mongoose from "mongoose";
import Worker from "@/models/Worker";

export async function getWorkers(
    adminId,
    {
        status = "all",
        workerType,
        limit,
    } = {}
) {
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    // -------------------------------
    // Build Filter
    // -------------------------------

    const filter = {
        adminId: adminObjectId,
    };

    // Active / Inactive filter
    if (status === "active") {
        filter.isActive = true;
    }

    if (status === "inactive") {
        filter.isActive = false;
    }

    // Worker type filter
    if (workerType) {
        filter.workerType = workerType;
    }

    // -------------------------------
    // Query
    // -------------------------------

    let query = Worker.find(filter)
        .select(
            "_id name mobile address workerType dailyWage joiningDate isActive"
        )
        .sort({
            name: 1,
        })
        .lean();

    // Apply limit only when Gemini/user
    // actually specifies one
    if (
        Number.isInteger(limit) &&
        limit > 0
    ) {
        query = query.limit(limit);
    }

    const workers = await query;

    return workers;
}