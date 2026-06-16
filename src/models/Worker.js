import { Schema,models,model} from "mongoose";

const workerSchema = new Schema(
    {
   
    adminId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },

   
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
      required:true,
      default: "",

    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    workerType: {
      type: String,
      enum: [
        "Rajmistri",
        "Helper",
        "Painter",
        "Electrician",
        "Plumber",
        "Carpenter",
        "Other",
      ],
      default: "Other",
    },

    dailyWage: {
      type: Number,
      required: true,
      min: 0,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }


);

workerSchema.index(
  {
    adminId: 1,
    mobile: 1
  },
  {
    unique: true
  }
);

const Worker = models.Worker || model("Worker", workerSchema);
export default Worker;