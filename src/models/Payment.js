import {Schema,models,model} from "mongoose";

const paymentSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer"],
      default: "Cash",
    },

    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes
paymentSchema.index({ adminId: 1, workerId: 1 });
paymentSchema.index({ workerId: 1, paymentDate: -1 });

const Payment = models.Payment ||
  model("Payment", paymentSchema);

export default Payment;