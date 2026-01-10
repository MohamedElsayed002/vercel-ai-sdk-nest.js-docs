import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BotDocument = HydratedDocument<Bot>;

@Schema()
export class Bot {
  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  content: string;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
  // owner: Owner;
}

export const BotSchema = SchemaFactory.createForClass(Bot);
