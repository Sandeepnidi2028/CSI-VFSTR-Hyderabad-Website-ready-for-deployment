import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    year: {
      type: String,
      default: 'Faculty',
      trim: true,
    },
    rollNumber: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    linkedin: {
      type: String,
      default: '',
      trim: true,
    },
    github: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'faculty',
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : '';
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : '';
        return ret;
      },
    },
  }
);

FacultySchema.index({ name: 1, position: 1 });

export const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema, 'faculty');
export default Faculty;
