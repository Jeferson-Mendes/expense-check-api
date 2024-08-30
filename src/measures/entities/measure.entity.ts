import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MeasureType {
  WATER = 'WATER',
  GAS = 'GAS',
}

@Entity()
export class Measure {
  @PrimaryGeneratedColumn('uuid')
  measure_uuid: string;

  @Column({ type: 'bigint' })
  measure_datetime: number;

  @Column({
    type: 'enum',
    enum: MeasureType,
  })
  measure_type: MeasureType;

  @Column()
  measure_value: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  has_confirmed: boolean;

  @Column()
  image_url: string;
}
