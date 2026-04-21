import mongoose, { Model, InferSchemaType, Schema } from 'mongoose';
import { BaseModel } from '.';

export enum GeoPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach extends BaseModel {
  name: string;
  position: GeoPosition;
  lat: number;
  lng: number;
  user: Schema.Types.ObjectId;
}

export interface ExistingBeach extends Beach {
  id: string;
}

const schema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: {
      type: String,
      required: true,
      enum: Object.values(GeoPosition),
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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

// 🔹 Tipo vindo do banco (SEM id)
export type BeachDB = InferSchemaType<typeof schema>;

// 🔹 Model
export const BeachModel: Model<BeachDB> = mongoose.model('Beach', schema);
