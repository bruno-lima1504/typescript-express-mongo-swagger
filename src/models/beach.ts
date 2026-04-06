import mongoose, { Model, InferSchemaType } from 'mongoose';

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach {
  _id?: string;
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
}

const schema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: {
      type: String,
      required: true,
      enum: Object.values(BeachPosition),
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

// 🔹 Tipo de saída (COM id)
export type Beach2 = BeachDB & {
  id: string;
};

// 🔹 Model
export const BeachModel: Model<BeachDB> = mongoose.model('Beach', schema);
