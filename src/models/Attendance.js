import { Schema, models, model } from "mongoose";

const attendanceSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    attendanceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Present", "Half Day", "Absent"],
      default: "Absent",
    },

    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per worker per day
attendanceSchema.index(
{
    adminId: 1,
    workerId: 1,
    attendanceDate: 1,
},
{
    unique: true,
}
);

// Faster queries for admin
attendanceSchema.index({
  adminId: 1,
  attendanceDate: -1,
});

const Attendance = models.Attendance || model("Attendance", attendanceSchema);

export default Attendance;