import mongoose, { Model, InferSchemaType } from 'mongoose';
import AuthService from '@src/services/auth';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: [true, 'Email must be unique'],
    },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_, ret: any): void => {
        ret.id = ret._id.toString(); // Agora funcionará se ret for tratado com flexibilidade
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.path('email').validate(
  async (email: string) => {
    const emailCount = await mongoose.models.User.countDocuments({ email });
    return !emailCount;
  },
  'already exists in database.',
  CUSTOM_VALIDATION.DUPLICATED
);

schema.pre('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  try {
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch (error) {
    console.log(error);
    console.error(`Error hashing the password for the user ${this.name}`);
  }
});

export type UserDB = InferSchemaType<typeof schema>;

export const UserModel: Model<UserDB> = mongoose.model('User', schema);
