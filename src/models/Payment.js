import { Schema, models, model } from "mongoose";

const paymentSchema = new Schema(
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

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Other"],
      default: "Cash",
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

// Faster queries
paymentSchema.index({
  adminId: 1,
  workerId: 1,
});

paymentSchema.index({
  paymentDate: -1,
});

const Payment = models.Payment || model("Payment", paymentSchema);

export default Payment;