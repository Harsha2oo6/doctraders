import "server-only";
import { Schema, model, models, type Model } from "mongoose";

type CounterDoc = { _id: string; seq: number };

const CounterSchema = new Schema<CounterDoc>({ _id: { type: String, required: true }, seq: { type: Number, default: 0 } });

export const CounterModel: Model<CounterDoc> =
  (models.Counter as Model<CounterDoc>) || model<CounterDoc>("Counter", CounterSchema);

/** Atomic sequence per key, e.g. "deal-2026" → 1, 2, 3… */
export async function nextSeq(key: string): Promise<number> {
  const c = await CounterModel.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return c.seq;
}

/** DT-2026-0001 */
export async function nextDealCode(now = new Date()): Promise<string> {
  const year = now.getFullYear();
  const seq = await nextSeq(`deal-${year}`);
  return `DT-${year}-${String(seq).padStart(4, "0")}`;
}
